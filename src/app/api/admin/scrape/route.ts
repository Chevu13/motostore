import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Kurs EUR -> RSD (možeš menjati). Marža predloga = 35%.
const EUR_TO_RSD = 117
const DEFAULT_MARGIN = 1.35

interface ScrapedProduct {
  name: string | null
  description: string | null
  brand: string | null
  sku: string | null
  priceEur: number | null
  supplierPriceRsd: number | null
  suggestedPriceRsd: number | null
  images: string[]
  sizes: string[]
  categorySlug: string | null
  supplierName: string | null
  supplierUrl: string
  source: string
}

// Mapiranje ključnih reči (DE/EN/SR) na tvoje kategorije
const CATEGORY_KEYWORDS: { slug: string; words: string[] }[] = [
  { slug: 'kacige', words: ['helm', 'helmet', 'kaciga', 'kacig', 'integral', 'jethelm', 'modular', 'klapphelm'] },
  { slug: 'jakne', words: ['jacke', 'jacket', 'jakna', 'jakn', 'blouson', 'textiljacke', 'lederjacke'] },
  { slug: 'pantalone', words: ['hose', 'pant', 'trouser', 'pantalone', 'pantalon', 'jeans', 'lederhose', 'textilhose'] },
  { slug: 'cizme', words: ['stiefel', 'boot', 'schuh', 'cizma', 'cizme', 'shoe', 'sneaker'] },
]

function detectCategory(text: string): string | null {
  const t = text.toLowerCase()
  for (const cat of CATEGORY_KEYWORDS) {
    if (cat.words.some((w) => t.includes(w))) return cat.slug
  }
  return null
}

// Poznati moto brendovi — za izvlačenje iz naziva kad JSON-LD nema brend
const KNOWN_BRANDS = [
  'Alpinestars', 'Dainese', 'Shoei', 'Arai', 'AGV', 'HJC', 'Schuberth', 'Nolan', 'Scorpion',
  'Daytona', 'Sidi', 'Forma', 'TCX', 'Gaerne', 'Stylmartin', 'Falco',
  'Rev’it', "Rev'it", 'Revit', 'Held', 'Büse', 'Buse', 'Macna', 'Furygan', 'Spidi', 'IXS', 'iXS',
  'Rukka', 'Klim', 'Richa', 'Bering', 'Modeka', 'Vanucci', 'Probiker', 'Germot', 'Held',
  'LS2', 'Caberg', 'Shark', 'Bell', 'Airoh', 'MT', 'Givi', 'Kappa', 'SW-Motech', 'Touratech',
  'Oxford', 'Acerbis', 'Leatt', 'Fox', 'O’Neal', "O'Neal", 'Oneal', 'Thor', 'Booster',
]

function detectBrand(name: string): string | null {
  if (!name) return null
  const lower = name.toLowerCase()
  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) return b
  }
  // fallback: prva reč naziva (često je brend)
  const first = name.trim().split(/\s+/)[0]
  if (first && first.length > 2 && /^[A-ZÄÖÜ]/.test(first)) return first
  return null
}

// Očisti tipično đubre iz naziva sa nemačkih shopova
function cleanName(name: string): string {
  return name
    .replace(/\s*\|\s*.*$/, '')
    .replace(/\s*-\s*(POLO Motorrad|Louis|FC-Moto|Hein Gericke|XLmoto).*$/i, '')
    .replace(/\bonline\s+kaufen\b/gi, '')
    .replace(/\bkaufen\b/gi, '')
    .replace(/\bbei\s+(POLO Motorrad|Louis|FC-Moto)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Prevod DE -> SR preko besplatnog Google Translate endpoint-a (bez ključa).
// Ako padne, vraća original.
async function translateToSerbian(text: string): Promise<string> {
  if (!text || !text.trim()) return text
  const input = text.slice(0, 4500)
  try {
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=sr&dt=t&q=' +
      encodeURIComponent(input)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return text
    const json = await res.json()
    if (Array.isArray(json) && Array.isArray(json[0])) {
      const translated = json[0]
        .map((seg: unknown[]) => (Array.isArray(seg) ? seg[0] : ''))
        .join('')
      return translated || text
    }
    return text
  } catch {
    return text
  }
}

function extractSizes(text: string): string[] {
  const found = new Set<string>()
  // Slovne veličine
  const letterSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
  // Tražimo izolovane veličine (sa razmakom/zarezom okolo)
  for (const sz of letterSizes) {
    const re = new RegExp(`(^|[\\s,>\\(\\[])${sz}([\\s,<\\)\\]]|$)`, 'i')
    if (re.test(text)) found.add(sz)
  }
  // Numeričke (npr. 38-48 za čizme/odeću)
  const numMatches = text.match(/\b(3[6-9]|4[0-9]|5[0-6])\b/g)
  if (numMatches) numMatches.slice(0, 12).forEach((n) => found.add(n))
  return Array.from(found).slice(0, 16)
}

function hostToSupplierName(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '')
    return h.split('.')[0].charAt(0).toUpperCase() + h.split('.')[0].slice(1)
  } catch {
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Neautorizovano' }, { status: 401 })
    }

    const { url } = await request.json()
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Neispravan URL' }, { status: 400 })
    }

    let html: string
    try {
      const res = await fetch(url, {
        headers: {
          // Neki sajtovi blokiraju botove ali puštaju Googlebot
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        return NextResponse.json(
          {
            error: `Sajt je vratio status ${res.status} — verovatno blokira automatske zahteve (Cloudflare). Popuni ručno: izaberi kategoriju, unesi cenu i dodaj slike u izmeni proizvoda.`,
          },
          { status: 502 },
        )
      }
      html = await res.text()
    } catch (e) {
      return NextResponse.json(
        { error: 'Nije moguće učitati stranicu (timeout ili blokada). Probaj ručni unos.' },
        { status: 502 },
      )
    }

    const $ = cheerio.load(html)
    const data: ScrapedProduct = {
      name: null,
      description: null,
      brand: null,
      sku: null,
      priceEur: null,
      supplierPriceRsd: null,
      suggestedPriceRsd: null,
      images: [],
      sizes: [],
      categorySlug: null,
      supplierName: hostToSupplierName(url),
      supplierUrl: url,
      source: '',
    }

    // 1) JSON-LD Schema.org Product (najpouzdanije, standardizovano)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const parsed = JSON.parse($(el).contents().text())
        const arr = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed]
        for (const item of arr) {
          const type = item['@type']
          const isProduct =
            type === 'Product' || (Array.isArray(type) && type.includes('Product'))
          if (!isProduct) continue

          data.name = data.name || item.name || null
          data.brand = data.brand || (item.brand?.name || item.brand) || null
          data.sku = data.sku || item.sku || item.mpn || null
          data.description = data.description || item.description || null

          if (item.image) {
            const imgs = Array.isArray(item.image) ? item.image : [item.image]
            data.images.push(
              ...imgs.map((i: unknown) => (typeof i === 'string' ? i : (i as { url?: string })?.url)).filter(Boolean) as string[],
            )
          }

          const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers
          if (offer?.price) {
            const cur = offer.priceCurrency || 'EUR'
            const val = parseFloat(String(offer.price))
            if (!isNaN(val) && cur === 'EUR') data.priceEur = data.priceEur || val
          }
          data.source = 'JSON-LD'
        }
      } catch {
        /* ignore loš JSON-LD */
      }
    })

    // 2) Open Graph fallback
    if (!data.name) {
      data.name = $('meta[property="og:title"]').attr('content') || null
      if (data.name) data.source = data.source || 'OpenGraph'
    }
    if (!data.description) {
      data.description = $('meta[property="og:description"]').attr('content') || null
    }
    const ogImg = $('meta[property="og:image"]').attr('content')
    if (ogImg && !data.images.includes(ogImg)) data.images.unshift(ogImg)

    // 2b) Pokupi SVE slike proizvoda iz galerije (img src, lazy-load atributi, srcset)
    const imgAttrs = ['src', 'data-src', 'data-zoom-image', 'data-image', 'data-large_image', 'data-lazy', 'data-original']
    $('img').each((_, el) => {
      const $el = $(el)
      for (const attr of imgAttrs) {
        let src = $el.attr(attr)
        if (!src) continue
        // srcset: uzmi najveću
        if (attr === 'src' && $el.attr('srcset')) {
          const srcset = $el.attr('srcset')!
          const last = srcset.split(',').pop()?.trim().split(' ')[0]
          if (last) src = last
        }
        if (src && src.startsWith('http')) {
          // filtriraj sitne ikonice/logoe/placeholder po imenu
          const low = src.toLowerCase()
          if (low.includes('logo') || low.includes('icon') || low.includes('sprite') || low.includes('placeholder') || low.includes('flag')) continue
          data.images.push(src)
        }
      }
    })
    // srcset zaseban prolaz (galerije često koriste samo srcset)
    $('img[srcset], source[srcset]').each((_, el) => {
      const srcset = $(el).attr('srcset')
      if (!srcset) return
      const best = srcset.split(',').map(s => s.trim().split(' ')[0]).filter(u => u.startsWith('http')).pop()
      if (best) data.images.push(best)
    })

    // 2c) Slike iz inline JSON skripti (Polo/Louis lazy-load galeriju kao JSON)
    $('script').each((_, el) => {
      const txt = $(el).contents().text()
      if (!txt || txt.length > 200000) return
      // nadji URL-ove slika u skripti
      const matches = txt.match(/https?:\\?\/\\?\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi)
      if (matches) {
        matches.forEach((m) => {
          const clean = m.replace(/\\/g, '')
          const low = clean.toLowerCase()
          if (low.includes('logo') || low.includes('icon') || low.includes('sprite') || low.includes('flag')) return
          data.images.push(clean)
        })
      }
    })

    // 2d) preload slike i picture source
    $('link[rel="preload"][as="image"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && href.startsWith('http')) data.images.push(href)
    })

    if (!data.priceEur) {
      const ogPrice = $('meta[property="product:price:amount"]').attr('content')
      if (ogPrice) {
        const v = parseFloat(ogPrice.replace(',', '.'))
        if (!isNaN(v)) data.priceEur = v
      }
    }

    // Brend fallback iz naziva
    if (!data.brand && data.name) {
      data.brand = detectBrand(data.name)
    }

    // 3) Očisti, deduplikuj i ograniči slike (do 12)
    data.images = Array.from(new Set(data.images))
      .filter((u) => u && u.startsWith('http'))
      .slice(0, 12)

    // 3b) Detekcija kategorije — iz naziva + URL-a + breadcrumb-a (PRE prevoda, na nemačkom)
    const breadcrumb = $('[class*="breadcrumb"], nav[aria-label*="readcrumb"]').text()
    const categoryText = `${data.name || ''} ${url} ${breadcrumb}`
    data.categorySlug = detectCategory(categoryText)

    // 3c) Izvlačenje veličina
    const sizeText: string[] = []
    $('select option, [class*="size"], [class*="groesse"], [data-size]').each((_, el) => {
      const t = $(el).text().trim()
      if (t && t.length <= 6) sizeText.push(t)
    })
    data.sizes = extractSizes(sizeText.join(' ') + ' ' + (data.description || ''))

    // Brend fallback iz naziva (PRE prevoda)
    if (!data.brand && data.name) {
      data.brand = detectBrand(data.name)
    }

    if (!data.name) {
      return NextResponse.json(
        {
          error:
            'Nisam uspeo da pročitam podatke sa ove stranice. Sajt možda nema standardne meta podatke — probaj ručni unos.',
          partial: data,
        },
        { status: 422 },
      )
    }

    // 4) Izračunaj nabavnu i predloženu prodajnu cenu
    if (data.priceEur) {
      data.supplierPriceRsd = Math.round(data.priceEur * EUR_TO_RSD)
      data.suggestedPriceRsd = Math.round((data.supplierPriceRsd * DEFAULT_MARGIN) / 100) * 100
    }

    // 5) Očisti naziv pa prevedi naziv i opis na srpski
    if (data.name) data.name = cleanName(data.name)
    const [trName, trDesc] = await Promise.all([
      translateToSerbian(data.name || ''),
      translateToSerbian(data.description || ''),
    ])
    data.name = trName || data.name
    data.description = trDesc || data.description

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Greška pri obradi: ' + String(error) }, { status: 500 })
  }
}
