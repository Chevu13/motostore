'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowRight, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import SizePickerModal from '@/components/ui/SizePickerModal'

interface Product {
  id: string; name: string; slug: string
  price: number; oldPrice?: number | null
  brand?: string | null; stockStatus: string
  images: { url: string; alt?: string | null }[]
  category: { name: string; slug: string }
  variants?: { id: string; type: string; value: string; stock: number }[]
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  const handleCartClick = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    setModalProduct(product)
  }

  return (
    <section className="py-24 relative" style={{ background: 'var(--bg)' }}>
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-orange-500/30 to-transparent" />

      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <div className="badge-orange mb-4">
              <Star size={10} fill="currentColor" />
              Popularno
            </div>
            <h2 className="text-5xl md:text-6xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Istaknuti <span className="gradient-text">proizvodi</span>
            </h2>
            <p className="text-white/40 mt-3 text-base font-light">Bestselleri iz naše kolekcije</p>
          </div>
          <Link
            href="/store"
            className="hidden md:flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-white/40 hover:text-orange-400 transition-colors duration-200 group"
          >
            Svi proizvodi
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {products.map((product, i) => {
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
            const oldPrice = product.oldPrice ? (typeof product.oldPrice === 'string' ? parseFloat(product.oldPrice) : product.oldPrice) : null
            const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <Link href={`/store/proizvod/${product.slug}`} className="product-card block group">
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-t-[13px]" style={{ aspectRatio: '4/3', background: '#0F0F18' }}>
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-108"
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🏍️</div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {discount > 0 && (
                        <span className="px-2.5 py-1 text-white text-[11px] font-black rounded-lg tracking-wide"
                          style={{ background: 'linear-gradient(135deg,#FF4500,#CC2200)', boxShadow: '0 2px 8px rgba(255,69,0,0.4)' }}>
                          -{discount}%
                        </span>
                      )}
                      {product.stockStatus === 'LOW_STOCK' && (
                        <span className="px-2.5 py-1 bg-amber-500/90 text-black text-[11px] font-black rounded-lg tracking-wide">
                          Poslednji
                        </span>
                      )}
                    </div>

                    {/* Quick add button */}
                    <button
                      onClick={(e) => handleCartClick(product, e)}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      style={{ background: 'linear-gradient(135deg,#FF4500,#CC2200)', boxShadow: '0 4px 16px rgba(255,69,0,0.5)' }}
                    >
                      <ShoppingCart size={12} />
                      <span className="hidden sm:block">U korpu</span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-500/80 mb-1.5">
                      {product.brand || product.category.name}
                    </p>
                    <h3 className="text-white/90 font-semibold text-[13px] leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="price-tag text-[20px]">{formatPrice(price)}</span>
                        {oldPrice && (
                          <span className="text-white/25 text-xs line-through">{formatPrice(oldPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {modalProduct && (
        <SizePickerModal
          open={!!modalProduct}
          onClose={() => setModalProduct(null)}
          product={{
            id: modalProduct.id,
            name: modalProduct.name,
            slug: modalProduct.slug,
            price: Number(modalProduct.price),
            image: modalProduct.images[0]?.url || '',
            variants: modalProduct.variants || [],
          }}
        />
      )}
    </section>
  )
}
