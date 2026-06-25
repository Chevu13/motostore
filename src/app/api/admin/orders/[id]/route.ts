import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { sendOrderStatusUpdateEmail } from '@/lib/email'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdminSession()
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdminSession()
    const body = await request.json()
    const { status, note } = body

    const validStatuses = ['ORDERED', 'CONFIRMED', 'PURCHASED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: id } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status,
        statusHistory: { create: { status, note: note || null } },
      },
    })

    // Send email notification
    sendOrderStatusUpdateEmail({
      orderNumber: order.orderNumber,
      email: order.email,
      firstName: order.firstName,
      status,
    }).catch(console.error)

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
