'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye, Filter } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatPrice } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  status: string
  total: number
  createdAt: string
}

const ALL_STATUSES = ['ORDERED', 'CONFIRMED', 'PURCHASED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED']

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/orders?${params}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders)
      setTotal(data.total)
      setPages(data.pages)
    }
    setLoading(false)
  }, [page, search, statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Porudžbine</h1>
        <p className="text-white/50 text-sm mt-1">{total} ukupno porudžbina</p>
      </div>

      <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchOrders() }} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži po broju, imenu, emailu..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <button type="submit" className="btn-moto px-4 py-2.5 rounded-lg text-sm">Traži</button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <select
            value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
          >
            <option value="">Sve porudžbine</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-lg">Nema porudžbina</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider">Broj</th>
                  <th className="text-left text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider">Kupac</th>
                  <th className="text-left text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Grad</th>
                  <th className="text-left text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Datum</th>
                  <th className="text-right text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider">Iznos</th>
                  <th className="text-center text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-sm text-orange-400">{order.orderNumber}</span></td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white font-medium">{order.firstName} {order.lastName}</p>
                        <p className="text-xs text-white/40">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-white/60">{order.city}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-white/60">{new Date(order.createdAt).toLocaleDateString('sr-RS')}</span></td>
                    <td className="px-4 py-3 text-right"><span className="text-sm font-semibold text-white">{formatPrice(order.total)}</span></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => router.push(`/admin/porudzbine/${order.id}`)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm text-white/60 hover:text-white disabled:opacity-30">← Prethodna</button>
            <span className="text-sm text-white/40">{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 text-sm text-white/60 hover:text-white disabled:opacity-30">Sledeća →</button>
          </div>
        )}
      </div>
    </div>
  )
}
