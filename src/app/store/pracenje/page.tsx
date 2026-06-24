'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, CheckCircle, Truck, MapPin, Star } from 'lucide-react'
import { formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils'

interface OrderData {
  orderNumber: string
  status: string
  firstName: string
  lastName: string
  createdAt: string
  total: number
  items: { productName: string; quantity: number; unitPrice: number }[]
  statusHistory: { status: string; createdAt: string }[]
}

const statusSteps = ['ORDERED', 'CONFIRMED', 'PURCHASED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED']

const stepIcons: Record<string, React.ElementType> = {
  ORDERED: Package,
  CONFIRMED: CheckCircle,
  PURCHASED: Star,
  IN_TRANSIT: Truck,
  ARRIVED: MapPin,
  DELIVERED: CheckCircle,
}

export default function TrackingPage() {
  const [orderNum, setOrderNum] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${orderNum}&email=${email}`)
      const data = await res.json()
      if (res.ok) setOrder(data)
      else setError(data.error || 'Porudžbina nije pronađena.')
    } catch {
      setError('Greška pri pretrazi. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? statusSteps.indexOf(order.status) : -1

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-3 text-center" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Pratite <span className="gradient-text">porudžbinu</span>
        </h1>
        <p className="text-gray-500 text-center mb-10">Unesite broj porudžbine i email adresu</p>

        <form onSubmit={handleSearch} className="glass rounded-2xl p-6 space-y-4 mb-8">
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Broj porudžbine</label>
            <input
              value={orderNum}
              onChange={e => setOrderNum(e.target.value)}
              placeholder="MS241201-1234"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-moto-orange/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Email adresa</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vas@email.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-moto-orange/50 transition-colors"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-moto w-full py-3 text-sm">
            <Search size={16} />
            {loading ? 'Pretraga...' : 'Pretraži porudžbinu'}
          </button>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4 border border-red-500/20 text-red-400 text-center mb-8">
            {error}
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Order header */}
            <div className="glass rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Broj porudžbine</p>
                  <p className="text-moto-orange font-black text-xl">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Ukupno</p>
                  <p className="text-white font-bold text-xl">{formatPrice(order.total)}</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Naručeno: {new Date(order.createdAt).toLocaleDateString('sr-RS')} · {order.firstName} {order.lastName}
              </p>
            </div>

            {/* Status timeline */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-black text-white uppercase mb-6" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Status porudžbine
              </h2>
              <div className="space-y-4">
                {statusSteps.map((step, i) => {
                  const Icon = stepIcons[step]
                  const isCompleted = i <= currentStep
                  const isCurrent = i === currentStep
                  return (
                    <div key={step} className={`flex items-center gap-4 transition-all ${isCompleted ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                        isCurrent ? 'border-moto-orange bg-moto-orange/20 scale-110' :
                        isCompleted ? 'border-green-500 bg-green-500/10' :
                        'border-white/10 bg-white/5'
                      }`}>
                        <Icon size={16} className={isCurrent ? 'text-moto-orange' : isCompleted ? 'text-green-400' : 'text-gray-600'} />
                      </div>
                      <div>
                        <p className={`font-semibold ${isCurrent ? 'text-moto-orange' : isCompleted ? 'text-white' : 'text-gray-600'}`}>
                          {ORDER_STATUS_LABELS[step]}
                          {isCurrent && <span className="ml-2 text-xs text-moto-orange bg-moto-orange/10 px-2 py-0.5 rounded-full">Trenutni status</span>}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Items */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-black text-white uppercase mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>Artikli</h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.productName} ×{item.quantity}</span>
                    <span className="text-white">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
