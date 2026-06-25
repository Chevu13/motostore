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
  supplierName: string | null
  supplierUrl: string
  source: string
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
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          Accept: 'text/html,application/xhtml+xml',
        },
        // 15s timeout preko AbortController
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        return NextResponse.json(
          { error: `Sajt je vratio status ${res.status}. Moguće da blokira automatske zahteve.` },
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

    if (!data.priceEur) {
      const ogPrice = $('meta[property="product:price:amount"]').attr('content')
      if (ogPrice) {
        const v = parseFloat(ogPrice.replace(',', '.'))
        if (!isNaN(v)) data.priceEur = v
      }
    }

    // 3) Očisti i ograniči slike
    data.images = Array.from(new Set(data.images))
      .filter((u) => u && u.startsWith('http'))
      .slice(0, 8)

    // 4) Izračunaj nabavnu i predloženu prodajnu cenu
    if (data.priceEur) {
      data.supplierPriceRsd = Math.round(data.priceEur * EUR_TO_RSD)
      // predlog prodajne: marža pa zaokruženo na 100 RSD
      data.suggestedPriceRsd = Math.round((data.supplierPriceRsd * DEFAULT_MARGIN) / 100) * 100
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

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Greška pri obradi: ' + String(error) }, { status: 500 })
  }
}
