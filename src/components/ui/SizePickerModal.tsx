'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { useToast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/utils'

interface Variant { id: string; type: string; value: string; stock: number }

interface Props {
  open: boolean
  onClose: () => void
  product: {
    id: string; name: string; slug: string
    price: number; image: string
    variants: Variant[]
  }
}

export default function SizePickerModal({ open, onClose, product }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const { toast } = useToast()
  const sizes = product.variants.filter(v => v.type === 'SIZE')

  const handleSelect = (size: string) => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      variant: size,
      slug: product.slug,
    })
    toast({ title: '✅ Dodato u korpu', description: `${product.name} — ${size}`, variant: 'success' })
    onClose()
  }

  const handleNoSize = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      slug: product.slug,
    })
    toast({ title: '✅ Dodato u korpu', description: product.name, variant: 'success' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4"
          >
            <div className="glass-dark rounded-2xl border border-white/[0.08] p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {product.image && (
                    <img src={product.image} alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/[0.06]" />
                  )}
                  <div>
                    <p className="text-white font-semibold text-sm line-clamp-2">{product.name}</p>
                    <p className="text-orange-400 font-black text-lg" style={{ fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif' }}>
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white transition-colors flex-shrink-0">
                  <X size={18} />
                </button>
              </div>

              {sizes.length > 0 ? (
                <>
                  <p className="text-white/60 text-sm mb-4 font-medium">Odaberite veličinu:</p>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {sizes.map(size => (
                      <button
                        key={size.id}
                        onClick={() => handleSelect(size.value)}
                        disabled={size.stock === 0}
                        className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                          size.stock === 0
                            ? 'border-white/5 text-white/20 cursor-not-allowed line-through'
                            : 'border-white/10 text-white/70 hover:border-orange-500 hover:text-white hover:bg-orange-500/10'
                        }`}
                      >
                        {size.value}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button
                  onClick={handleNoSize}
                  className="w-full btn-moto py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingCart size={16} />
                  Dodaj u korpu
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
