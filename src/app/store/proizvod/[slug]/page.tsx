import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import ProductPageClient from './ProductPageClient'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  })
  if (!product) return {}
  return {
    title: `${product.name} | MotoStore.rs`,
    description: product.shortDescription || product.description?.slice(0, 160) || '',
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const productRaw = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      variants: { where: { isActive: true } },
      specifications: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!productRaw) notFound()

  const similarRaw = await prisma.product.findMany({
    where: { categoryId: productRaw.categoryId, isActive: true, id: { not: productRaw.id } },
    include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
    take: 4,
  })

  // Convert Decimal to number for client components
  const product = {
    ...productRaw,
    price: Number(productRaw.price),
    oldPrice: productRaw.oldPrice ? Number(productRaw.oldPrice) : null,
    supplierPrice: productRaw.supplierPrice ? Number(productRaw.supplierPrice) : null,
    variants: productRaw.variants.map(v => ({
      ...v,
      priceAdjust: v.priceAdjust ? Number(v.priceAdjust) : null,
    })),
  }

  const similar = similarRaw.map(p => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    supplierPrice: p.supplierPrice ? Number(p.supplierPrice) : null,
  }))

  return <ProductPageClient product={product} similar={similar} />
}
