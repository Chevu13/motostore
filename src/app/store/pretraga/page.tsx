'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  brand?: string
  images: { url: string }[]
  category: { name: string; slug: string }
}

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(query)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    setInputValue(query)
    if (!query) return
    const fetchProducts = async () => {
      setLoading(true)
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
      setLoading(false)
      setSearched(true)
    }
    fetchProducts()
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) router.push(`/store/pretraga?q=${encodeURIComponent(inputValue.trim())}`)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Search form */}
        <div className="max-w-xl mx-auto mb-10">
          <h1 className="text-3xl font-bold text-white text-center mb-6">Pretraga</h1>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Pretraži kacige, jakne, rukavice..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-32 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
              autoFocus
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-moto px-5 py-2 rounded-lg text-sm font-medium">
              Traži
            </button>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && query && (
          <div>
            <p className="text-white/50 text-sm mb-6">
              {products.length > 0
                ? `Pronađeno ${products.length} rezultata za "${query}"`
                : `Nema rezultata za "${query}"`}
            </p>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40 text-lg mb-2">Nema pronađenih proizvoda</p>
                <p className="text-white/30 text-sm">Pokušajte sa drugačijim terminima pretrage</p>
                <Link href="/store" className="mt-6 inline-block btn-moto px-6 py-3 rounded-xl text-sm font-medium">
                  Pregledaj sve kategorije
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <Link key={product.id} href={`/store/proizvod/${product.slug}`} className="product-card group block">
                    <div className="aspect-square bg-white/5 rounded-xl overflow-hidden mb-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10 text-4xl">🏍</div>
                      )}
                    </div>
                    <div className="p-2">
                      {product.brand && <p className="text-orange-400/70 text-xs font-medium mb-1">{product.brand}</p>}
                      <h3 className="text-white text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{formatPrice(product.price)}</span>
                        {product.oldPrice && (
                          <span className="text-white/30 text-xs line-through">{formatPrice(product.oldPrice)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {!query && !searched && (
          <div className="text-center py-12 text-white/30">
            <p>Unesite termin za pretragu</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchResults />
    </Suspense>
  )
}
