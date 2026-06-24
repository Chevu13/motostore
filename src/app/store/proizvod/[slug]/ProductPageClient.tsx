'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Zap, ChevronRight, CheckCircle, AlertTriangle, Package, Shield, X } from 'lucide-react'
import { formatPrice, STOCK_STATUS_LABELS } from '@/lib/utils'
import { useCartStore } from '@/lib/cart-store'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface ProductImage { url: string; alt?: string | null }
interface ProductVariant { id: string; type: string; value: string; stock: number }
interface ProductSpec { label: string; value: string }

interface Product {
  id: string; name: string; slug: string
  description?: string | null; shortDescription?: string | null
  price: number; oldPrice?: number | null
  brand?: string | null; stockStatus: string; stockQuantity: number
  images: ProductImage[]; category: { name: string; slug: string }
  variants: ProductVariant[]; specifications: ProductSpec[]
}

interface SimilarProduct {
  id: string; name: string; slug: string
  price: number; oldPrice?: number | null; brand?: string | null
  images: { url: string }[]; category: { name: string }
}

export default function ProductPageClient({ product, similar }: { product: Product; similar: SimilarProduct[] }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const { toast } = useToast()
  const router = useRouter()

  const price = Number(product.price)
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0
  const sizes = product.variants.filter(v => v.type === 'SIZE')

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast({ title: '⚠️ Odaberite veličinu', variant: 'destructive' })
      // Scroll to size selector
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price,
      image: product.images[0]?.url || '',
      quantity: qty,
      variant: selectedSize || undefined,
      slug: product.slug,
    })
    toast({ title: '✅ Dodato u korpu', description: `${product.name}${selectedSize ? ` — ${selectedSize}` : ''}`, variant: 'success' })
  }

  const handleBuyNow = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast({ title: '⚠️ Odaberite veličinu', variant: 'destructive' })
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    handleAddToCart()
    router.push('/store/korpa')
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/30 mb-8 flex-wrap">
        <Link href="/store" className="hover:text-orange-400 transition-colors">Početna</Link>
        <ChevronRight size={13} />
        <Link href={`/store/kategorija/${product.category.slug}`} className="hover:text-orange-400 transition-colors">{product.category.name}</Link>
        <ChevronRight size={13} />
        <span className="text-white/60 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-4">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06]"
            style={{ background: '#0F0F18' }}
          >
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt || product.name}
                fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🏍️</div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1.5 text-white text-sm font-black rounded-lg"
                style={{ background: 'linear-gradient(135deg,#FF4500,#CC2200)' }}>
                -{discount}%
              </span>
            )}
          </motion.div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-orange-500' : 'border-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {product.brand && (
            <p className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-2">{product.brand}</p>
          )}
          <h1 className="font-black text-white mb-4" style={{ fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.05 }}>
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-5">
            <span className="font-black text-orange-400" style={{ fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif', fontSize: '42px' }}>
              {formatPrice(price)}
            </span>
            {oldPrice && (
              <span className="text-xl text-white/25 line-through">{formatPrice(oldPrice)}</span>
            )}
          </div>

          {/* Stock */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold mb-5 border ${
            product.stockStatus === 'IN_STOCK' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            product.stockStatus === 'LOW_STOCK' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {product.stockStatus === 'IN_STOCK' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            {STOCK_STATUS_LABELS[product.stockStatus]}
          </div>

          {product.shortDescription && (
            <p className="text-white/50 mb-6 leading-relaxed text-[15px]">{product.shortDescription}</p>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="mb-6" id="size-selector">
              <p className="text-white font-semibold mb-3 flex items-center gap-2">
                Veličina
                {!selectedSize && <span className="text-xs text-orange-400 font-normal">(obavezno odaberi)</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.value)}
                    disabled={size.stock === 0}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                      size.stock === 0
                        ? 'border-white/5 text-white/20 cursor-not-allowed line-through'
                        : selectedSize === size.value
                        ? 'border-orange-500 bg-orange-500/15 text-white shadow-[0_0_15px_rgba(255,69,0,0.2)]'
                        : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {size.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-white font-semibold">Količina:</p>
            <div className="flex items-center rounded-xl border border-white/10 overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all text-lg">−</button>
              <span className="w-10 text-center text-white font-bold">{qty}</span>
              <button onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all text-lg">+</button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-bold uppercase tracking-wide transition-all border border-white/10 hover:border-orange-500/30 hover:bg-white/5"
              style={{ fontSize: '13px', letterSpacing: '0.1em' }}>
              <ShoppingCart size={18} />
              Dodaj u korpu
            </button>
            <button onClick={handleBuyNow} className="flex-1 btn-moto py-4 text-sm">
              <Zap size={18} />
              Kupi odmah
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, text: 'CE sertifikovano' },
              { icon: Package, text: 'Dostava 2-5 dana' },
              { icon: CheckCircle, text: 'Pouzeće' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/[0.06] text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Icon size={16} className="text-orange-400" />
                <span className="text-xs text-white/40">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {product.description && (
          <div className="rounded-2xl p-6 border border-white/[0.06]" style={{ background: 'var(--bg-3)' }}>
            <h2 className="font-black text-white uppercase mb-5 text-2xl" style={{ fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif' }}>
              Opis proizvoda
            </h2>
            <p className="text-white/50 leading-relaxed whitespace-pre-line text-[15px]">{product.description}</p>
          </div>
        )}

        {product.specifications.length > 0 && (
          <div className="rounded-2xl p-6 border border-white/[0.06]" style={{ background: 'var(--bg-3)' }}>
            <h2 className="font-black text-white uppercase mb-5 text-2xl" style={{ fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif' }}>
              Specifikacije
            </h2>
            <div className="space-y-0">
              {product.specifications.map((spec, i) => (
                <div key={i} className={`flex justify-between py-3 ${i < product.specifications.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                  <span className="text-white/40 text-sm">{spec.label}</span>
                  <span className="text-white text-sm font-semibold text-right ml-4">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <div>
          <h2 className="font-black text-white uppercase mb-8" style={{ fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif', fontSize: '36px' }}>
            Slični <span className="gradient-text">proizvodi</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map(prod => (
              <Link key={prod.id} href={`/store/proizvod/${prod.slug}`} className="product-card block group">
                <div className="relative aspect-square overflow-hidden rounded-t-[13px]" style={{ background: '#0F0F18' }}>
                  {prod.images[0] ? (
                    <Image src={prod.images[0].url} alt={prod.name} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🏍️</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-orange-500/80 font-bold uppercase tracking-wide mb-1">{prod.brand || prod.category.name}</p>
                  <p className="text-white/85 text-sm font-medium line-clamp-2 mb-2">{prod.name}</p>
                  <span className="price-tag text-lg">{formatPrice(Number(prod.price))}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
