import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import CategoryPageClient from './CategoryPageClient'

interface Props {
  params: { slug: string }
  searchParams: { sort?: string; brand?: string; page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!category) return {}
  return {
    title: `${category.name} - MotoStore.rs`,
    description: category.description || `Kupite ${category.name} online. Dostava na kućnu adresu, plaćanje pouzećem.`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!category) notFound()

  const page = parseInt(searchParams.page || '1')
  const perPage = 12
  const skip = (page - 1) * perPage

  const orderBy = searchParams.sort === 'price_asc'
    ? { price: 'asc' as const }
    : searchParams.sort === 'price_desc'
    ? { price: 'desc' as const }
    : { createdAt: 'desc' as const }

  const where = {
    categoryId: category.id,
    isActive: true,
    ...(searchParams.brand && { brand: searchParams.brand }),
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
    <CategoryPageClient
      category={category}
      products={products}
      total={total}
      page={page}
      perPage={perPage}
      brands={brands.map(b => b.brand!).filter(Boolean)}
      currentSort={searchParams.sort || 'newest'}
      currentBrand={searchParams.brand}
    />
  )
}
