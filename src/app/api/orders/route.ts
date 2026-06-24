import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, address, city, postalCode, note, items, subtotal, shippingCost, total } = body

    // Validate
    if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode || !items?.length) {
      return NextResponse.json({ error: 'Nedostaju obavezni podaci' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        note: note || null,
        subtotal,
        shippingCost,
        total,
        paymentMethod: 'cash_on_delivery',
        status: 'ORDERED',
        items: {
          create: items.map((item: {
            productId: string
            productName: string
            variantInfo?: string
            quantity: number
            unitPrice: number
            totalPrice: number
          }) => ({
            productId: item.productId,
            productName: item.productName,
            variantInfo: item.variantInfo || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
        statusHistory: {
          create: { status: 'ORDERED', note: 'Porudžbina kreirana' },
        },
      },
      include: { items: true },
    })

    // Send emails (non-blocking)
    const emailData = {
      orderNumber: order.orderNumber,
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      postalCode: order.postalCode,
      note: order.note,
      total: Number(order.total),
      items: order.items.map(item => ({
        productName: item.productName,
        variantInfo: item.variantInfo,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    }

    // Send emails in background
    Promise.all([
      sendOrderConfirmationEmail(emailData).catch(console.error),
      sendAdminOrderNotificationEmail(emailData).catch(console.error),
    ])

    return NextResponse.json({ orderNumber: order.orderNumber, id: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Greška pri kreiranju porudžbine' }, { status: 500 })
  }
}
