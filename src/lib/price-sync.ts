import * as cheerio from 'cheerio'

const EUR_TO_RSD = 117

export interface SupplierData {
  ok: boolean
  priceEur: number | null
  supplierPriceRsd: number | null
  availableSizes: string[]
  error?: string
}

// Izvuci AKTUELNU cenu i DOSTUPNE veličine sa dobavljačeve stranice
export async function fetchSupplierData(url: string): Promise<SupplierData> {
  const out: SupplierData = { ok: false, priceEur: null, supplierPriceRsd: null, availableSizes: [] }

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) {
      out.error = `HTTP ${res.status}`
      return out
    }
    html = await res.text()
  } catch (e) {
    out.error = 'fetch failed: ' + String(e)
    return out
  }

  const $ = cheerio.load(html)

  // --- CENA: JSON-LD pa OG ---
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text())
      const arr = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed]
      for (const item of arr) {
        const type = item['@type']
        const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'))
        if (!isProduct) continue
        const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers
        if (offer?.price) {
          const cur = offer.priceCurrency || 'EUR'
          const val = parseFloat(String(offer.price))
          if (!isNaN(val) && cur === 'EUR' && !out.priceEur) out.priceEur = val
        }
      }
    } catch {
      /* ignore */
    }
  })
  if (!out.priceEur) {
    const ogPrice = $('meta[property="product:price:amount"]').attr('content')
    if (ogPrice) {
      const v = parseFloat(ogPrice.replace(',', '.'))
      if (!isNaN(v)) out.priceEur = v
    }
  }

  // --- VELIČINE: samo dostupne (preskoči sold-out: strikethrough/disabled) ---
  const sizeSet = new Set<string>()
  const letterSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
  // Tipični selektori za veličine na shop stranicama
  $('[class*="size"] button, [class*="size"] li, [class*="size"] label, [class*="groesse"] button, button[class*="variant"], li[class*="variant"], [data-size]').each((_, el) => {
    const $el = $(el)
    const txt = $el.text().trim().toUpperCase()
    if (!txt || txt.length > 4) return

    // Da li je rasprodato? (disabled, strikethrough, sold-out klase/atributi)
    const cls = ($el.attr('class') || '').toLowerCase()
    const disabled =
      $el.is('[disabled]') ||
      $el.attr('aria-disabled') === 'true' ||
      cls.includes('disabled') ||
      cls.includes('soldout') ||
      cls.includes('sold-out') ||
      cls.includes('unavailable') ||
      cls.includes('out-of-stock') ||
      $el.find('del, s, strike').length > 0 ||
      $el.css('text-decoration')?.includes('line-through')

    if (disabled) return

    // prihvati slovne ili numeričke (36-56)
    if (letterSizes.includes(txt) || /^(3[6-9]|4[0-9]|5[0-6])$/.test(txt)) {
      sizeSet.add(txt)
    }
  })

  out.availableSizes = Array.from(sizeSet)
  out.priceEur = out.priceEur
  if (out.priceEur) out.supplierPriceRsd = Math.round(out.priceEur * EUR_TO_RSD)
  out.ok = out.priceEur != null || out.availableSizes.length > 0
  return out
}
