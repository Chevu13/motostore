'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import SizePickerModal from '@/components/ui/SizePickerModal'

interface Product {
  id: string; name: string; slug: string
  price: number; oldPrice?: number | null
  brand?: string | null; stockStatus: string
  images: { url: string; alt?: string | null }[]
  category: { name: string }
  variants?: { id: string; type: string; value: string; stock: number }[]
}

interface Category {
  id: string; name: string; slug: string; description?: string | null
}

interface Props {
  category: Category; products: Product[]; total: number
  page: number; perPage: number; brands: string[]
  currentSort: string; currentBrand?: string
}

export default function CategoryPageClient({
  category, products, total, page, perPage, brands, currentSort, currentBrand,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / perPage)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const handleCartClick = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    setModalProduct(product)
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-moto-orange transition-colors">Početna</Link>
        <ChevronRight size={14} />
        <span className="text-white">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            {category.name}
          </h1>
          {category.description && <p className="text-gray-500 mt-2">{category.description}</p>}
          <p className="text-gray-600 text-sm mt-1">{total} proizvoda</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {brands.length > 0 && (
            <select
              value={currentBrand || ''}
              onChange={(e) => updateFilter('brand', e.target.value || null)}
              className="bg-[#111118] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-moto-orange/50"
            >
              <option value="">Svi brendovi</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
          <select
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="bg-[#111118] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-moto-orange/50"
          >
            <option value="newest">Najnoviji</option>
            <option value="price_asc">Cena: manja-veća</option>
            <option value="price_desc">Cena: veća-manja</option>
          </select>
        </div>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🏍️</p>
          <h2 className="text-2xl font-bold text-white mb-2">Nema proizvoda</h2>
          <p className="text-gray-500">Uskoro dodajemo nove proizvode u ovu kategoriju.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, i) => {
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number
            const oldPrice = product.oldPrice
              ? typeof product.oldPrice === 'string' ? parseFloat(product.oldPrice) : product.oldPrice as number
              : null
            const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/proizvod/${product.slug}`} className="product-card block group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-[#1a1a24]">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🏍️</div>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-moto-orange text-white text-xs font-bold rounded-md">
                        -{discount}%
                      </span>
                    )}
                    <button
                      onClick={(e) => handleCartClick(product, e)}
                      className="absolute bottom-3 right-3 p-2.5 bg-moto-orange rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white hover:bg-red-600"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-moto-orange font-semibold uppercase tracking-wider mb-1">{product.brand || product.category.name}</p>
                    <h3 className="text-white font-semibold text-sm leading-snug mb-3 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="price-tag text-xl">{formatPrice(price)}</span>
                      {oldPrice && <span className="text-gray-600 text-sm line-through">{formatPrice(oldPrice)}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => updateFilter('page', String(i + 1))}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                page === i + 1
                  ? 'bg-moto-orange text-white'
                  : 'glass text-gray-400 hover:text-white hover:border-moto-orange/30'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Size picker modal */}
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
    </div>
  )
}
