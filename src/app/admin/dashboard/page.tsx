import { prisma } from '@/lib/prisma'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingBag, Package, TrendingUp, Clock, ArrowRight } from 'lucide-react'

export default async function AdminDashboard() {
  const [
    totalOrders,
    totalProducts,
    pendingOrders,
    recentOrders,
    revenueResult,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: 'ORDERED' } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { items: { take: 1 } },
    }),
    prisma.order.aggregate({ _sum: { total: true } }),
  ])

  const totalRevenue = Number(revenueResult._sum.total || 0)

  const stats = [
    { label: 'Ukupno porudžbina', value: totalOrders, icon: ShoppingBag, color: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-500/8' },
    { label: 'Na čekanju', value: pendingOrders, icon: Clock, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/8' },
    { label: 'Aktivni proizvodi', value: totalProducts, icon: Package, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/8' },
    { label: 'Ukupan prihod', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-[#FF4500]', border: 'border-[#FF4500]/20', bg: 'bg-[#FF4500]/8' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white uppercase tracking-widest" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Pregled
        </h1>
        <p className="text-white/30 text-sm mt-1">Dobrodošli u admin panel MotoStore.rs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, border, bg }) => (
          <div key={label} className="bg-[#0D0D15] border border-white/6 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-xs uppercase tracking-wider">{label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${bg} ${border}`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className={`text-2xl font-semibold ${color}`} style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[#0D0D15] border border-white/6 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Poslednje porudžbine
          </h2>
          <Link href="/admin/porudzbine" className="flex items-center gap-1 text-[#FF4500] text-xs hover:text-white transition-colors">
            Sve <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-3 text-xs text-white/25 uppercase tracking-wider font-normal">Broj</th>
                <th className="pb-3 text-xs text-white/25 uppercase tracking-wider font-normal">Kupac</th>
                <th className="pb-3 text-xs text-white/25 uppercase tracking-wider font-normal hidden md:table-cell">Datum</th>
                <th className="pb-3 text-xs text-white/25 uppercase tracking-wider font-normal">Iznos</th>
                <th className="pb-3 text-xs text-white/25 uppercase tracking-wider font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map(order => (
                <tr key={order.id} className="group hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/porudzbine/${order.id}`}
                      className="text-[#FF4500] text-sm font-medium hover:text-white transition-colors"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-white text-sm">{order.firstName} {order.lastName}</p>
                    <p className="text-white/30 text-xs">{order.email}</p>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <p className="text-white/40 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('sr-RS')}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-white text-sm font-medium">{formatPrice(Number(order.total))}</p>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag size={36} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/30 text-sm">Nema porudžbina</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
