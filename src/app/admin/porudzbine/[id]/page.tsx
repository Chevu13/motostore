'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Clock, ChevronDown } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatPrice } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: { name: string; slug: string; images: { url: string }[] }
  variant?: { type: string; value: string }
}

interface StatusHistory {
  id: string
  status: string
  note?: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  note?: string
  status: string
  total: number
  shippingCost: number
  createdAt: string
  items: OrderItem[]
  statusHistory: StatusHistory[]
}

const ALL_STATUSES = ['ORDERED', 'CONFIRMED', 'PURCHASED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED']

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(`/api/admin/orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
        setNewStatus(data.order.status)
      }
      setLoading(false)
    }
    fetchOrder()
  }, [params.id])

  const handleStatusUpdate = async () => {
    if (!order || newStatus === order.status) return
    setUpdating(true)
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note: statusNote }),
    })
    if (res.ok) {
      const data = await res.json()
      setOrder(prev => prev ? { ...prev, ...data.order } : null)
      setStatusNote('')
      toast({ title: 'Status ažuriran', description: `Porudžbina prebačena u: ${ORDER_STATUS_LABELS[newStatus]}`, variant: 'success' })
    } else {
      toast({ title: 'Greška', description: 'Nije moguće ažurirati status', variant: 'destructive' })
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 text-center text-white/40">
        <p>Porudžbina nije pronađena</p>
        <button onClick={() => router.push('/admin/porudzbine')} className="mt-4 text-orange-400 hover:text-orange-300">
          Nazad na porudžbine
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/admin/porudzbine')}
          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="font-mono text-orange-400">{order.orderNumber}</span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date(order.createdAt).toLocaleString('sr-RS')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-400" />
              Stavke porudžbine
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-white/40 text-xs mt-0.5">
                        {item.variant.type}: {item.variant.value}
                      </p>
                    )}
                    <p className="text-white/60 text-xs mt-1">Kom: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-white/40 text-xs">{formatPrice(item.price)} / kom</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>Dostava</span>
                <span>{order.shippingCost === 0 ? 'Besplatno' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-white font-bold">
                <span>Ukupno</span>
                <span className="text-orange-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status history */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Istorija statusa
            </h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-4">
                {order.statusHistory.map((entry, i) => (
                  <div key={entry.id} className="relative flex items-start gap-4 pl-8">
                    <div className={`absolute left-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${i === order.statusHistory.length - 1 ? 'border-orange-500 bg-orange-500/20 text-orange-400' : 'border-white/20 bg-white/5 text-white/40'}`}>
                      {order.statusHistory.length - i}
                    </div>
                    <div className="flex-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS[entry.status]}`}>
                        {ORDER_STATUS_LABELS[entry.status]}
                      </span>
                      {entry.note && <p className="text-white/50 text-xs mt-1">{entry.note}</p>}
                      <p className="text-white/30 text-xs mt-1">
                        {new Date(entry.createdAt).toLocaleString('sr-RS')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Change status */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Promeni status</h2>
            <div className="space-y-3">
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 appearance-none"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-gray-900">{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Napomena (opciono)"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 resize-none"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
                className="w-full btn-moto py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Ažuriranje...' : 'Sačuvaj status'}
              </button>
            </div>
          </div>

          {/* Customer info */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-400" />
              Podaci kupca
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-white/40 text-xs mb-0.5">Ime i prezime</p>
                <p className="text-white text-sm font-medium">{order.firstName} {order.lastName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <a href={`tel:${order.phone}`} className="text-sm text-orange-400 hover:text-orange-300">
                  {order.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <a href={`mailto:${order.email}`} className="text-sm text-orange-400 hover:text-orange-300 truncate">
                  {order.email}
                </a>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-white/10">
                <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white">{order.address}</p>
                  <p className="text-sm text-white/60">{order.city}, {order.postalCode}</p>
                </div>
              </div>
              {order.note && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/40 text-xs mb-1">Napomena kupca</p>
                  <p className="text-sm text-white/70 italic">"{order.note}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
