import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/home/HeroSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import DeliveryBanner from '@/components/home/DeliveryBanner'
import NewsletterSection from '@/components/home/NewsletterSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const featuredProductsRaw = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
      variants: { where: { isActive: true } },
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  // Convert Decimal to number for client components
  const featuredProducts = featuredProductsRaw.map(p => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    supplierPrice: p.supplierPrice ? Number(p.supplierPrice) : null,
  }))

  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts products={featuredProducts} />
      <TestimonialsSection />
      <DeliveryBanner />
      <NewsletterSection />
    </div>
  )
}
