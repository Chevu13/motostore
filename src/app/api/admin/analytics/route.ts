import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdminSession()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalProducts,
      activeProducts,
      totalCategories,
      recentOrders,
      last30DaysOrders,
      last7DaysOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['ORDERED', 'CONFIRMED'] } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { orderNumber: true, firstName: true, lastName: true, total: true, status: true, createdAt: true },
      }),
      prisma.order.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { total: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { total: true } }),
    ])

    const revenue30Days = last30DaysOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const revenue7Days = last7DaysOrders.reduce((sum, o) => sum + Number(o.total), 0)

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    // Top products by order count
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    const topProductIds = topProducts.map((p) => p.productId)
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, price: true, supplierPrice: true },
    })

    const topProductsWithDetails = topProducts.map((p) => ({
      ...p,
      _sum: { quantity: p._sum.quantity },
      product: topProductDetails.find((d) => d.id === p.productId) ? {
        ...topProductDetails.find((d) => d.id === p.productId)!,
        price: Number(topProductDetails.find((d) => d.id === p.productId)!.price),
        supplierPrice: topProductDetails.find((d) => d.id === p.productId)!.supplierPrice 
          ? Number(topProductDetails.find((d) => d.id === p.productId)!.supplierPrice) : null,
      } : undefined,
    }))

    const recentOrdersSerialized = recentOrders.map(o => ({
      ...o,
      total: Number(o.total),
    }))

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        activeProducts,
        totalCategories,
        revenue30Days,
        revenue7Days,
        ordersLast30Days: last30DaysOrders.length,
        ordersLast7Days: last7DaysOrders.length,
      },
      recentOrders: recentOrdersSerialized,
      ordersByStatus,
      topProducts: topProductsWithDetails,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
