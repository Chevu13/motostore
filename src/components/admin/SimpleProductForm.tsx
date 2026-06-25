'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Loader2, X, Link2, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  slug: string
}

export default function SimpleProductForm() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [scraping, setScraping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scraped, setScraped] = useState(false)

  // Ručna polja
  const [supplierUrl, setSupplierUrl] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  // Automatski popunjeno sa linka (može da se doradi)
  const [categoryId, setCategoryId] = useState('')
  const [supplierPrice, setSupplierPrice] = useState('')
  const [brand, setBrand] = useState('')
  const [sizes, setSizes] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
  }, [])

  const scrape = async () => {
    const url = supplierUrl.trim()
    if (!url || !url.startsWith('http')) {
      toast({ title: 'Unesi ispravan link dobavljača', variant: 'destructive' })
      return
    }
    setScraping(true)
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast({ title: 'Povlačenje nije uspelo', description: json.error || 'Probaj ručni unos', variant: 'destructive' })
        return
      }
      const p = json.product

      // Popuni
      if (p.name && !name) setName(p.name)
      if (p.description && !description) setDescription(p.description)
      if (p.suggestedPriceRsd && !price) setPrice(String(p.suggestedPriceRsd))
      if (p.supplierPriceRsd) setSupplierPrice(String(p.supplierPriceRsd))
      if (p.brand) setBrand(p.brand)
      if (p.sizes?.length) setSizes(p.sizes)
      if (p.images?.length) setImages(p.images)

      // Kategorija — nadji ID po slug-u
      if (p.categorySlug) {
        const cat = categories.find((c) => c.slug === p.categorySlug)
        if (cat) setCategoryId(cat.id)
      }

      setScraped(true)
      toast({
        title: '✓ Podaci povučeni',
        description: `${p.images?.length || 0} slika · ${p.sizes?.length || 0} veličina${p.priceEur ? ` · ${p.priceEur}€` : ''}`,
        variant: 'success',
      })
    } catch {
      toast({ title: 'Greška pri povlačenju', variant: 'destructive' })
    } finally {
      setScraping(false)
    }
  }

  const removeImage = (i: number) => setImages(images.filter((_, idx) => idx !== i))
  const removeSize = (i: number) => setSizes(sizes.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!name || !price || !categoryId) {
      toast({
        title: 'Nedostaju podaci',
        description: 'Naziv, prodajna cena i kategorija su obavezni',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        brand: brand || null,
        categoryId,
        supplierUrl: supplierUrl || null,
        supplierPrice: supplierPrice ? parseFloat(supplierPrice) : null,
        stockStatus: 'IN_STOCK',
        isActive: true,
        images: images.map((url, i) => ({ url, alt: name, isPrimary: i === 0 })),
        variants: sizes.map((s) => ({ type: 'SIZE', value: s, stock: 0 })),
      }
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast({ title: '✓ Proizvod kreiran', variant: 'success' })
        router.push('/admin/proizvodi')
      } else {
        const d = await res.json()
        toast({ title: 'Greška', description: d.error || 'Nije moguće sačuvati', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška pri čuvanju', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const inp =
    'w-full bg-[#16161f] border border-white/10 rounded-lg px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4500]/50 transition-colors'
  const lbl = 'text-xs text-white/45 mb-1.5 block uppercase tracking-wider'

  const marza = (() => {
    const n = parseFloat(supplierPrice)
    const p = parseFloat(price)
    if (!n || !p || n <= 0 || p <= 0) return null
    const pct = Math.round(((p - n) / p) * 100)
    return { pct, color: pct >= 30 ? 'text-emerald-400' : pct >= 15 ? 'text-amber-400' : 'text-red-400' }
  })()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/admin/proizvodi')}
          className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1
          className="text-xl font-semibold text-white uppercase tracking-widest"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          Novi proizvod
        </h1>
      </div>

      <div className="bg-[#0D0D15] border border-white/6 rounded-xl p-6 space-y-5">
        {/* LINK + povuci */}
        <div>
          <label className={lbl}>🔗 Link dobavljača (nemački sajt)</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={supplierUrl}
                onChange={(e) => setSupplierUrl(e.target.value)}
                placeholder="https://www.louis.de/..."
                className={`${inp} pl-9`}
              />
            </div>
            <button
              onClick={scrape}
              disabled={scraping || !supplierUrl.trim()}
              className="px-4 py-3 rounded-lg bg-[#FF4500] text-white text-sm font-medium hover:bg-[#FF5722] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {scraping ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {scraping ? 'Povlačim...' : 'Povuci'}
            </button>
          </div>
          <p className="mt-2 text-xs text-white/30">
            Zalepi link i klikni Povuci — sam popunjava kategoriju, nabavnu cenu, brend, veličine i slike.
          </p>
        </div>

        <div className="h-px bg-white/6" />

        {/* NAZIV */}
        <div>
          <label className={lbl}>Naziv *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv proizvoda" className={inp} />
        </div>

        {/* PRODAJNA CENA */}
        <div>
          <label className={lbl}>Prodajna cena (RSD) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className={inp}
          />
          {supplierPrice && (
            <p className="mt-1.5 text-xs text-white/35">
              Nabavna: {new Intl.NumberFormat('sr-RS').format(parseFloat(supplierPrice))} RSD
              {marza && <span className={`ml-2 font-medium ${marza.color}`}>marža {marza.pct}%</span>}
            </p>
          )}
        </div>

        {/* OPIS */}
        <div>
          <label className={lbl}>Opis</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Opis proizvoda..."
            className={`${inp} resize-none`}
          />
        </div>

        {/* AUTO-POPUNJENO — prikaz za proveru */}
        {scraped && (
          <div className="rounded-xl border border-[#FF4500]/20 bg-[#FF4500]/5 p-4 space-y-4">
            <p className="text-xs uppercase tracking-wider text-[#FF4500] flex items-center gap-1.5">
              <Check size={13} /> Automatski povučeno — proveri i doteraj
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Kategorija */}
              <div>
                <label className={lbl}>Kategorija *</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inp}>
                  <option value="">Izaberi</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-gray-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Brend */}
              <div>
                <label className={lbl}>Brend</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="—" className={inp} />
              </div>
            </div>

            {/* Veličine */}
            <div>
              <label className={lbl}>Veličine ({sizes.length})</label>
              {sizes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/8 border border-white/10 rounded-lg text-xs text-white"
                    >
                      {s}
                      <button onClick={() => removeSize(i)} className="text-white/40 hover:text-red-400">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/30">Nije pronađeno — možeš dodati ručno u izmeni proizvoda.</p>
              )}
            </div>

            {/* Slike */}
            <div>
              <label className={lbl}>Slike ({images.length})</label>
              {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className="relative group aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/8"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 bg-[#FF4500] text-white text-[9px] px-1.5 py-0.5 rounded">
                          Glavna
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white/70 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/30">Nije pronađeno.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button onClick={() => router.push('/admin/proizvodi')} className="px-5 py-2.5 text-sm text-white/40 hover:text-white transition-colors">
          Otkaži
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="btn-moto px-6 py-2.5 rounded-lg text-sm disabled:opacity-50"
        >
          {saving ? 'Čuvanje...' : 'Kreiraj proizvod'}
        </button>
      </div>
    </div>
  )
}
