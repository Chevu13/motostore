import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId) where.categoryId = categoryId

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession()
    const body = await request.json()
    const {
      name, description, shortDescription, price, oldPrice,
      sku, brand, stockStatus, stockQuantity, isActive, isFeatured,
      categoryId, metaTitle, metaDescription, supplierUrl, supplierPrice,
      images = [], variants = [], specifications = [],
    } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 })
    }

    let slug = slugify(name)
    // Ensure unique slug
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        sku,
        brand,
        stockStatus: stockStatus || 'IN_STOCK',
        stockQuantity: stockQuantity || 0,
        isActive: isActive !== false,
        isFeatured: isFeatured || false,
        categoryId,
        metaTitle,
        metaDescription,
        supplierUrl: supplierUrl || null,
        supplierPrice: supplierPrice ? parseFloat(supplierPrice) : null,
        images: {
          create: images.map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({
            url: img.url,
            alt: img.alt || name,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
        variants: {
          create: variants.map((v: { type: string; value: string; priceAdjust?: number; stock?: number }) => ({
            type: v.type,
            value: v.value,
            priceAdjust: v.priceAdjust || 0,
            stock: v.stock || 0,
          })),
        },
        specifications: {
          create: specifications.map((s: { label: string; value: string }, i: number) => ({
            label: s.label,
            value: s.value,
            sortOrder: i,
          })),
        },
      },
      include: { images: true, variants: true, specifications: true },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
