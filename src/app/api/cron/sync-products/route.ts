import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchSupplierData } from '@/lib/price-sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH_SIZE = 8 // koliko artikala po pozivu (drži ispod vremenskog limita)

export async function GET(request: NextRequest) {
  // Zaštita: samo Vercel cron ili neko sa tajnom sme da pokrene
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')
  if (secret && auth !== `Bearer ${secret}` && !isVercelCron) {
    return NextResponse.json({ error: 'Neautorizovano' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') || undefined

  // Uzmi seriju proizvoda koji imaju supplierUrl, sortirano po id-u (stabilan redosled za ulančavanje)
  const products = await prisma.product.findMany({
    where: {
      supplierUrl: { not: null },
      ...(cursor ? { id: { gt: cursor } } : {}),
    },
    orderBy: { id: 'asc' },
    take: BATCH_SIZE,
    include: { variants: { where: { type: 'SIZE' } } },
  })

  if (products.length === 0) {
    return NextResponse.json({ done: true, message: 'Sve obrađeno' })
  }

  const results: Array<{ id: string; name: string; changed: string[]; error?: string }> = []

  for (const p of products) {
    const log: string[] = []
    try {
      const data = await fetchSupplierData(p.supplierUrl!)
      if (!data.ok) {
        results.push({ id: p.id, name: p.name, changed: [], error: data.error || 'nedostupno' })
        continue
      }

      const updates: Record<string, unknown> = {}

      // --- CENA: pomeri prodajnu za isti % kao dobavljač ---
      const oldSupplier = Number(p.supplierPrice || 0)
      const newSupplier = data.supplierPriceRsd
      if (newSupplier && oldSupplier > 0 && newSupplier !== oldSupplier) {
        const ratio = newSupplier / oldSupplier
        const oldSelling = Number(p.price)
        const newSelling = Math.round((oldSelling * ratio) / 100) * 100 // zaokruži na 100 RSD
        updates.price = newSelling
        updates.supplierPrice = newSupplier
        const pct = Math.round((ratio - 1) * 100)
        log.push(`cena ${oldSelling}→${newSelling} RSD (${pct > 0 ? '+' : ''}${pct}%)`)
      } else if (newSupplier && oldSupplier === 0) {
        // prvi put nemamo nabavnu — samo upiši
        updates.supplierPrice = newSupplier
      }

      // upiši izmene cene
      if (Object.keys(updates).length > 0) {
        await prisma.product.update({ where: { id: p.id }, data: updates })
      }

      // --- VELIČINE: aktiviraj dostupne, deaktiviraj nestale, dodaj nove ---
      if (data.availableSizes.length > 0) {
        const available = new Set(data.availableSizes.map((s) => s.toUpperCase()))
        const existing = p.variants

        // deaktiviraj/aktiviraj postojeće
        for (const v of existing) {
          const shouldBeActive = available.has(v.value.toUpperCase())
          if (v.isActive !== shouldBeActive) {
            await prisma.productVariant.update({
              where: { id: v.id },
              data: { isActive: shouldBeActive, stock: shouldBeActive ? Math.max(v.stock, 1) : 0 },
            })
            log.push(`${v.value} ${shouldBeActive ? 'aktivna' : 'rasprodato'}`)
          }
        }

        // dodaj nove veličine kojih nema
        const existingValues = new Set(existing.map((v) => v.value.toUpperCase()))
        for (const sz of Array.from(available)) {
          if (!existingValues.has(sz)) {
            await prisma.productVariant.create({
              data: { productId: p.id, type: 'SIZE', value: sz, stock: 1, isActive: true },
            })
            log.push(`+${sz} nova`)
          }
        }
      }

      results.push({ id: p.id, name: p.name, changed: log })
    } catch (e) {
      results.push({ id: p.id, name: p.name, changed: [], error: String(e) })
    }
  }

  // --- Ulančavanje: ako ima još, pozovi sebe za sledeću seriju (fire-and-forget) ---
  const lastId = products[products.length - 1].id
  const more = products.length === BATCH_SIZE
  if (more) {
    const base = new URL(request.url)
    base.searchParams.set('cursor', lastId)
    // ne čekamo odgovor — pokrećemo sledeću seriju i odmah vraćamo
    fetch(base.toString(), {
      headers: secret ? { authorization: `Bearer ${secret}` } : {},
    }).catch(() => {})
  }

  return NextResponse.json({
    processed: results.length,
    nextCursor: more ? lastId : null,
    done: !more,
    results,
  })
}
