import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdminSession()
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specifications: { orderBy: { sortOrder: 'asc' } },
      },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ product })
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
    const {
      name, description, shortDescription, price, oldPrice,
      sku, brand, stockStatus, stockQuantity, isActive, isFeatured,
      categoryId, metaTitle, metaDescription, supplierUrl, supplierPrice,
      images, variants, specifications,
    } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription
    if (price !== undefined) updateData.price = parseFloat(price)
    if (oldPrice !== undefined) updateData.oldPrice = oldPrice ? parseFloat(oldPrice) : null
    if (sku !== undefined) updateData.sku = sku
    if (brand !== undefined) updateData.brand = brand
    if (stockStatus !== undefined) updateData.stockStatus = stockStatus
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity
    if (isActive !== undefined) updateData.isActive = isActive
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (supplierUrl !== undefined) updateData.supplierUrl = supplierUrl || null
    if (supplierPrice !== undefined) updateData.supplierPrice = supplierPrice ? parseFloat(supplierPrice) : null

    // Handle images replacement
    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      updateData.images = {
        create: images.map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({
          url: img.url,
          alt: img.alt || name,
          isPrimary: i === 0,
          sortOrder: i,
        })),
      }
    }

    // Handle specifications replacement
    if (specifications !== undefined) {
      await prisma.productSpec.deleteMany({ where: { productId: id } })
      updateData.specifications = {
        create: specifications.map((s: { label: string; value: string }, i: number) => ({
          label: s.label,
          value: s.value,
          sortOrder: i,
        })),
      }
    }

    // Handle variants replacement
    if (variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } })
      updateData.variants = {
        create: variants.map((v: { type: string; value: string; priceAdjust?: number; stock?: number }) => ({
          type: v.type,
          value: v.value,
          priceAdjust: v.priceAdjust || 0,
          stock: v.stock || 0,
        })),
      }
    }

    const product = await prisma.product.update({
      where: { id: id },
      data: updateData,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specifications: { orderBy: { sortOrder: 'asc' } },
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdminSession()
    await prisma.product.delete({ where: { id: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
