'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Package, TrendingUp, Clock, CheckCircle, Tag } from 'lucide-react'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

interface AnalyticsData {
  stats: {
    totalOrders: number
    pendingOrders: number
    deliveredOrders: number
    totalProducts: number
    activeProducts: number
    totalCategories: number
    revenue30Days: number
    revenue7Days: number
    ordersLast30Days: number
    ordersLast7Days: number
  }
  recentOrders: {
    orderNumber: string
    firstName: string
    lastName: string
    total: number
    status: string
    createdAt: string
  }[]
  ordersByStatus: { status: string; _count: { status: number } }[]
  topProducts: {
    productId: string
    _sum: { quantity: number }
    product?: { name: string; price: number }
  }[]
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/admin/analytics')
      if (res.ok) setData(await res.json())
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return <div className="p-6 text-white/40">Nije moguće učitati analitiku</div>

  const { stats } = data

  const statCards = [
    { label: 'Ukupno porudžbina', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Na čekanju', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Isporučeno', value: stats.deliveredOrders, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Aktivni proizvodi', value: stats.activeProducts, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Prihod (7 dana)', value: formatPrice(stats.revenue7Days), icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10', isPrice: true },
    { label: 'Prihod (30 dana)', value: formatPrice(stats.revenue30Days), icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10', isPrice: true },
    { label: 'Kategorije', value: stats.totalCategories, icon: Tag, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Narudžbine (30 dana)', value: stats.ordersLast30Days, icon: ShoppingBag, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analitika</h1>
        <p className="text-white/50 text-sm mt-1">Pregled prodaje i poslovanja</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-medium">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="glass rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Porudžbine po statusu</h2>
          <div className="space-y-3">
            {data.ordersByStatus.map((entry) => {
              const total = data.stats.totalOrders || 1
              const pct = Math.round((entry._count.status / total) * 100)
              return (
                <div key={entry.status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ORDER_STATUS_COLORS[entry.status]}`}>
                      {ORDER_STATUS_LABELS[entry.status]}
                    </span>
                    <span className="text-sm text-white font-medium">{entry._count.status}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="glass rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Najprodavaniji proizvodi</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Nema podataka</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((item, i) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white/20 w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.product?.name || 'Nepoznato'}</p>
                    <p className="text-xs text-white/40">{item.product ? formatPrice(item.product.price) : ''}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-400 flex-shrink-0">
                    {item._sum.quantity} kom
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4">Poslednje porudžbine</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Nema porudžbina</p>
          ) : (
            <div className="space-y-2">
              {data.recentOrders.map((order) => (
                <div key={order.orderNumber} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                  <span className="font-mono text-xs text-orange-400 flex-shrink-0">{order.orderNumber}</span>
                  <span className="text-sm text-white flex-1 truncate">{order.firstName} {order.lastName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${ORDER_STATUS_COLORS[order.status]} hidden sm:inline-flex`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-sm font-semibold text-white flex-shrink-0">{formatPrice(order.total)}</span>
                  <span className="text-xs text-white/30 flex-shrink-0 hidden md:block">
                    {new Date(order.createdAt).toLocaleDateString('sr-RS')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
