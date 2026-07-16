'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

const SHIPPING_COST = 390
const FREE_SHIPPING_THRESHOLD = 15000

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()
  const total = totalPrice()
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const finalTotal = total + shipping

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <ShoppingBag size={80} className="mx-auto text-gray-700 mb-6" />
          <h1 className="text-4xl font-black text-white uppercase mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Korpa je prazna
          </h1>
          <p className="text-gray-500 mb-8">Dodajte proizvode iz naše ponude</p>
          <Link href="/kategorija/kacige" className="btn-moto inline-flex">
            Istraži ponudu <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-8" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
        Vaša <span className="gradient-text">korpa</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className="relative w-20 h-20 bg-[#1a1a24] rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏍️</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/store/proizvod/${item.slug}`} className="text-white font-semibold hover:text-moto-orange transition-colors line-clamp-1">
                    {item.name}
                  </Link>
                  {item.variant && <p className="text-gray-500 text-sm">Veličina: {item.variant}</p>}
                  <p className="text-moto-orange font-bold">{formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center glass rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >-</button>
                    <span className="w-8 text-center text-white text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >+</button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-white font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-black text-white uppercase mb-6" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Pregled porudžbine
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Ukupno artikala</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Dostava</span>
                <span className={shipping === 0 ? 'text-[#3FAE6A] font-semibold' : ''}>
                  {shipping === 0 ? 'BESPLATNO' : formatPrice(shipping)}
                </span>
              </div>
              {total < FREE_SHIPPING_THRESHOLD && (
                <div className="p-3 glass-orange rounded-lg text-xs text-moto-orange">
                  <Truck size={12} className="inline mr-1" />
                  Dodajte još {formatPrice(FREE_SHIPPING_THRESHOLD - total)} za besplatnu dostavu
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white font-bold text-lg">Za uplatu:</span>
                <span className="price-tag text-2xl">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="mb-4 p-3 glass-orange rounded-lg text-center">
              <p className="text-moto-orange font-bold text-sm">💵 Plaćanje pouzećem</p>
              <p className="text-gray-500 text-xs mt-1">Platite gotovinom kuriru pri isporuci</p>
            </div>

            <Link href="/store/porudzbina" className="btn-moto w-full text-center flex items-center justify-center gap-2">
              Nastavi sa porudžbinom <ArrowRight size={16} />
            </Link>

            <Link href="/kategorija/kacige" className="block text-center text-gray-500 hover:text-gray-300 text-sm mt-4 transition-colors">
              Nastavi kupovinu
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
