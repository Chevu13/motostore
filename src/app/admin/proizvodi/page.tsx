'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Package, Star } from 'lucide-react'
import { formatPrice, STOCK_STATUS_LABELS } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  oldPrice?: number
  stockStatus: string
  isActive: boolean
  isFeatured: boolean
  category: { name: string }
  images: { url: string }[]
  createdAt: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/products?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data.products)
      setTotal(data.total)
      setPages(data.pages)
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleToggleFeatured = async (id: string, current: boolean) => {
    setTogglingId(id)
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !current }),
    })
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !current } : p))
      toast({ title: !current ? '⭐ Dodato na naslovnu' : 'Uklonjeno sa naslovne', variant: 'success' })
    }
    setTogglingId(null)
  }

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Obrisati proizvod "${name}"? Ova akcija je nepovratna.`)) return
    setDeleting(id)
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id))
      setTotal(prev => prev - 1)
      toast({ title: 'Obrisano', description: `"${name}" je obrisan.`, variant: 'success' })
    } else {
      toast({ title: 'Greška', description: 'Nije moguće obrisati proizvod', variant: 'destructive' })
    }
    setDeleting(null)
  }

  const stockColors: Record<string, string> = {
    IN_STOCK: 'text-green-400',
    LOW_STOCK: 'text-yellow-400',
    OUT_OF_STOCK: 'text-red-400',
    PREORDER: 'text-blue-400',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Proizvodi</h1>
          <p className="text-white/50 text-sm mt-1">{total} ukupno proizvoda</p>
        </div>
        <button
          onClick={() => router.push('/admin/proizvodi/novi')}
          className="btn-moto px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novi proizvod
        </button>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchProducts() }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži po nazivu, brendu, SKU..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <button type="submit" className="btn-moto px-4 py-2.5 rounded-lg text-sm">Traži</button>
        </form>
      </div>

      {/* Product grid */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">Nema proizvoda</p>
            <button
              onClick={() => router.push('/admin/proizvodi/novi')}
              className="mt-4 text-orange-400 hover:text-orange-300 text-sm"
            >
              Dodaj prvi proizvod →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider">Proizvod</th>
                  <th className="text-left text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Kategorija</th>
                  <th className="text-right text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider">Cena</th>
                  <th className="text-center text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider hidden sm:table-cell">Stanje</th>
                  <th className="text-center text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Naslovna</th>
                  <th className="text-center text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Aktivan</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium line-clamp-1">{product.name}</p>
                          {product.brand && <p className="text-xs text-white/40">{product.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-white/60">{product.category?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <p className="text-sm font-semibold text-white">{formatPrice(product.price)}</p>
                        {product.oldPrice && (
                          <p className="text-xs text-white/30 line-through">{formatPrice(product.oldPrice)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`text-xs font-medium ${stockColors[product.stockStatus] || 'text-white/60'}`}>
                        {STOCK_STATUS_LABELS[product.stockStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <button
                        onClick={() => handleToggleFeatured(product.id, product.isFeatured)}
                        disabled={togglingId === product.id}
                        title={product.isFeatured ? 'Ukloni sa naslovne' : 'Dodaj na naslovnu'}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${product.isFeatured ? 'text-yellow-400 bg-yellow-500/15 hover:bg-yellow-500/25' : 'text-white/20 hover:text-yellow-400 hover:bg-yellow-500/10'}`}
                      >
                        <Star className="w-4 h-4" fill={product.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className={`inline-block w-2 h-2 rounded-full ${product.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/admin/proizvodi/${product.id}`)}
                          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
