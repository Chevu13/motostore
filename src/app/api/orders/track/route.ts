import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderNumber = searchParams.get('orderNumber')
  const email = searchParams.get('email')

  if (!orderNumber || !email) {
    return NextResponse.json({ error: 'Nedostaju parametri' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      email: { equals: email, mode: 'insensitive' },
    },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Porudžbina nije pronađena. Proverite broj porudžbine i email.' }, { status: 404 })
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    firstName: order.firstName,
    lastName: order.lastName,
    createdAt: order.createdAt,
    total: Number(order.total),
    items: order.items.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
    statusHistory: order.statusHistory.map(h => ({
      status: h.status,
      createdAt: h.createdAt,
    })),
  })
}
