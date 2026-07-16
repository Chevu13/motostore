import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import CategoryPageClient from './CategoryPageClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; brand?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return {}
  return {
    title: `${category.name} - MotoStore.rs`,
    description: category.description || `Kupite ${category.name} online. Dostava na kućnu adresu, plaćanje pouzećem.`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const page = parseInt(sp.page || '1')
  const perPage = 12
  const skip = (page - 1) * perPage

  const orderBy = sp.sort === 'price_asc'
    ? { price: 'asc' as const }
    : sp.sort === 'price_desc'
    ? { price: 'desc' as const }
    : { createdAt: 'desc' as const }

  const where = {
    categoryId: category.id,
    isActive: true,
    ...(sp.brand && { brand: sp.brand }),
  }

  const [productsRaw, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
        variants: { where: { isActive: true } },
      },
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ])

  const brands = await prisma.product.findMany({
    where: { categoryId: category.id, isActive: true, brand: { not: null } },
    select: { brand: true },
    distinct: ['brand'],
  })

  // Convert Decimal to number
  const products = productsRaw.map(p => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    supplierPrice: p.supplierPrice ? Number(p.supplierPrice) : null,
  }))

  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
    <CategoryPageClient
      category={category}
      products={products}
      total={total}
      page={page}
      perPage={perPage}
      brands={brands.map(b => b.brand!).filter(Boolean)}
      currentSort={sp.sort || 'newest'}
      currentBrand={sp.brand}
    />
    </Suspense>
  )
}
