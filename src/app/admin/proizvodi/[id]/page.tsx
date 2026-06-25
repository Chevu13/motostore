'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch(`/api/admin/products/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        const p = data.product
        setProduct({
          id: p.id,
          name: p.name,
          description: p.description || '',
          shortDescription: p.shortDescription || '',
          price: String(p.price),
          oldPrice: p.oldPrice ? String(p.oldPrice) : '',
          sku: p.sku || '',
          brand: p.brand || '',
          stockStatus: p.stockStatus,
          stockQuantity: String(p.stockQuantity),
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          categoryId: p.categoryId,
          metaTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '',
          supplierUrl: p.supplierUrl || '',
          supplierPrice: p.supplierPrice ? String(p.supplierPrice) : '',
          images: p.images.map((img: { url: string; alt: string }) => ({ url: img.url, alt: img.alt || '' })),
          variants: p.variants.map((v: { type: string; value: string; priceAdjust: number; stock: number }) => ({
            type: v.type,
            value: v.value,
            priceAdjust: String(v.priceAdjust),
            stock: String(v.stock),
          })),
          specifications: p.specifications.map((s: { label: string; value: string }) => ({ label: s.label, value: s.value })),
        })
      }
      setLoading(false)
    }
    fetch_()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return <div className="p-6 text-center text-white/40">Proizvod nije pronađen</div>
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProductForm mode="edit" initialData={product as any} />
}
