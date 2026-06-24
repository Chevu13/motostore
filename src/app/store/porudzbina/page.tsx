'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { CheckCircle, Loader2, ShoppingBag, Truck } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

interface FormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  note?: string
}

const SHIPPING_COST = 390
const FREE_SHIPPING_THRESHOLD = 15000

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const total = totalPrice()
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const finalTotal = total + shipping

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  if (items.length === 0 && !orderNumber) {
    router.push('/store/korpa')
    return null
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map(item => ({
            productId: item.productId,
            productName: item.name,
            variantInfo: item.variant || null,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
          })),
          subtotal: total,
          shippingCost: shipping,
          total: finalTotal,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        setOrderNumber(result.orderNumber)
        clearCart()
      } else {
        alert('Greška pri kreiranju porudžbine. Pokušajte ponovo.')
      }
    } catch {
      alert('Greška. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  if (orderNumber) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
          <div className="w-24 h-24 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-400" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-4xl font-black text-white uppercase mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Porudžbina primljena!
          </h1>
          <div className="glass-orange rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-1">Broj vaše porudžbine</p>
            <p className="text-moto-orange font-black text-2xl">{orderNumber}</p>
          </div>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Poslali smo vam email sa potvrdom. Uskoro ćemo vas kontaktirati za potvrdu. 
            Plaćate gotovinom kuriru pri preuzimanju.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`/pracenje?order=${orderNumber}`} className="btn-moto inline-flex">
              Pratite porudžbinu
            </a>
            <a href="/" className="btn-outline-moto inline-flex">Početna</a>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-8" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
        Završi <span className="gradient-text">porudžbinu</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-black text-white uppercase mb-6" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Podaci za dostavu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Ime *</label>
                <input
                  {...register('firstName', { required: 'Obavezno polje' })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-moto-orange/50 transition-colors"
                  placeholder="Vaše ime"
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Prezime *</label>
                <input
                  {...register('lastName', { required: 'Obavezno polje' })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-moto-orange/50 transition-colors"
                  placeholder="Vaše prezime"
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Telefon *</label>
                <input
                  {...register('phone', { required: 'Obavezno polje' })}
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-moto-orange/50 transition-colors"
                  placeholder="+381 60 123 4567"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Email *</label>
                <input
                  {...register('email', { required: 'Obavezno polje', pattern: { value: /^\S+@\S+$/i, message: 'Nevalidan email' } })}
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-moto-orange/50 transition-colors"
                  placeholder="vas@email.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 text-sm mb-1.5 block">Adresa *</label>
                <input
                  {...register('address', { required: 'Obavezno polje' })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-moto-orange/50 transition-colors"
                  placeholder="Ulica i broj"
                />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Grad *</label>
                <input
                  {...register('city', { required: 'Obavezno polje' })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-moto-orange/50 transition-colors"
                  placeholder="Beograd"
                />
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Poštanski broj *</label>
                <input
                  {...register('postalCode', { required: 'Obavezno polje' })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-moto-orange/50 transition-colors"
                  placeholder="11000"
                />
                {errors.postalCode && <p className="text-red-400 text-xs mt-1">{errors.postalCode.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 text-sm mb-1.5 block">Napomena (opciono)</label>
                <textarea
                  {...register('note')}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-moto-orange/50 transition-colors resize-none"
                  placeholder="Posebne napomene za dostavu..."
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-black text-white uppercase mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Način plaćanja
            </h2>
            <div className="flex items-center gap-4 glass-orange rounded-xl p-4">
              <div className="w-10 h-10 bg-moto-orange/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">💵</span>
              </div>
              <div>
                <p className="text-white font-bold">Pouzeće - gotovinska dostava</p>
                <p className="text-gray-500 text-sm">Plaćate gotovinom kuriru pri preuzimanju paketa</p>
              </div>
              <div className="ml-auto w-5 h-5 rounded-full bg-moto-orange border-2 border-moto-orange flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-moto w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Obrada porudžbine...</>
            ) : (
              <><ShoppingBag size={18} /> Potvrdi porudžbinu ({formatPrice(finalTotal)})</>
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="glass rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-xl font-black text-white uppercase mb-6" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Pregled ({items.length} artik.)
          </h2>
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.id} className="flex justify-between gap-2">
                <span className="text-gray-400 text-sm line-clamp-1 flex-1">
                  {item.name} {item.variant ? `(${item.variant})` : ''} ×{item.quantity}
                </span>
                <span className="text-white text-sm font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Međuzbir</span><span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Dostava</span>
              <span className={shipping === 0 ? 'text-green-400 font-semibold' : ''}>
                {shipping === 0 ? 'BESPLATNO' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2">
              <span>UKUPNO</span><span className="text-moto-orange">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
