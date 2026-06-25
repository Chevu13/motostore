'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload, ArrowLeft, Link2, Image as ImageIcon, Download, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
}

interface ProductFormData {
  name: string
  description: string
  shortDescription: string
  price: string
  oldPrice: string
  sku: string
  brand: string
  stockStatus: string
  stockQuantity: string
  isActive: boolean
  isFeatured: boolean
  categoryId: string
  metaTitle: string
  metaDescription: string
  supplierUrl: string
  supplierPrice: string
  supplierPriceEur: string
  images: { url: string; alt: string }[]
  variants: { type: string; value: string; priceAdjust: string; stock: string }[]
  specifications: { label: string; value: string }[]
}

const STOCK_STATUSES = [
  { value: 'IN_STOCK', label: 'Na stanju' },
  { value: 'LOW_STOCK', label: 'Malo na stanju' },
  { value: 'OUT_OF_STOCK', label: 'Nema na stanju' },
  { value: 'PREORDER', label: 'Prednarudžbina' },
]

const VARIANT_TYPES = [
  { label: 'Veličina', value: 'SIZE' },
  { label: 'Boja', value: 'COLOR' },
  { label: 'Materijal', value: 'MATERIAL' },
]

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: string }
  mode: 'create' | 'edit'
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [scraping, setScraping] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'nabavka' | 'images' | 'variants' | 'specs' | 'seo'>('basic')

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    oldPrice: '',
    sku: '',
    brand: '',
    stockStatus: 'IN_STOCK',
    stockQuantity: '0',
    isActive: true,
    isFeatured: false,
    categoryId: '',
    metaTitle: '',
    metaDescription: '',
    supplierUrl: '',
    supplierPrice: '',
    supplierPriceEur: '',
    images: [],
    variants: [],
    specifications: [],
    ...initialData,
  })

  useEffect(() => {
    const fetchCats = async () => {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    }
    fetchCats()
  }, [])

  const update = (field: keyof ProductFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Upload sa kompa
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const data = await res.json()
      update('images', [...form.images, { url: data.url, alt: form.name || file.name }])
      toast({ title: '✓ Slika uploadovana', variant: 'success' })
    } else {
      toast({ title: 'Upload nije uspeo', description: 'Proverite Supabase Storage podešavanja', variant: 'destructive' })
    }
    setUploading(false)
    e.target.value = ''
  }

  // Dodaj po URL-u
  const handleAddByUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (!trimmed.startsWith('http')) {
      toast({ title: 'Neispravan URL', variant: 'destructive' })
      return
    }
    update('images', [...form.images, { url: trimmed, alt: form.name || 'slika' }])
    setUrlInput('')
    toast({ title: '✓ Slika dodata', variant: 'success' })
  }

  const removeImage = (i: number) => {
    update('images', form.images.filter((_, idx) => idx !== i))
  }

  const addVariant = () => {
    update('variants', [...form.variants, { type: 'SIZE', value: '', priceAdjust: '0', stock: '0' }])
  }

  const updateVariant = (i: number, field: string, value: string) => {
    const next = [...form.variants]
    next[i] = { ...next[i], [field]: value }
    update('variants', next)
  }

  const removeVariant = (i: number) => {
    update('variants', form.variants.filter((_, idx) => idx !== i))
  }

  const addSpec = () => {
    update('specifications', [...form.specifications, { label: '', value: '' }])
  }

  const updateSpec = (i: number, field: string, value: string) => {
    const next = [...form.specifications]
    next[i] = { ...next[i], [field]: value }
    update('specifications', next)
  }

  const removeSpec = (i: number) => {
    update('specifications', form.specifications.filter((_, idx) => idx !== i))
  }

  // Povlačenje podataka sa dobavljačevog URL-a
  const scrapeFromUrl = async () => {
    const targetUrl = form.supplierUrl.trim()
    if (!targetUrl || !targetUrl.startsWith('http')) {
      toast({ title: 'Unesi ispravan URL dobavljača', variant: 'destructive' })
      return
    }
    setScraping(true)
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast({ title: 'Povlačenje nije uspelo', description: json.error || 'Probaj ručni unos', variant: 'destructive' })
        return
      }

      const p = json.product
      // Popuni samo polja koja su prazna ili ih korisnik želi prepisati
      setForm(prev => ({
        ...prev,
        name: prev.name || p.name || '',
        description: prev.description || p.description || '',
        brand: prev.brand || p.brand || '',
        sku: prev.sku || p.sku || '',
        supplierPriceEur: p.priceEur ? String(p.priceEur) : prev.supplierPriceEur,
        supplierPrice: p.supplierPriceRsd ? String(p.supplierPriceRsd) : prev.supplierPrice,
        price: prev.price || (p.suggestedPriceRsd ? String(p.suggestedPriceRsd) : ''),
        images: [
          ...prev.images,
          ...(p.images || [])
            .filter((u: string) => !prev.images.some(img => img.url === u))
            .map((u: string) => ({ url: u, alt: p.name || 'slika' })),
        ],
      }))

      toast({
        title: '✓ Podaci povučeni',
        description: `${p.name?.slice(0, 40) || 'Proizvod'} · ${p.images?.length || 0} slika${p.priceEur ? ` · ${p.priceEur}€` : ''}`,
        variant: 'success',
      })
    } catch (e) {
      toast({ title: 'Greška pri povlačenju', description: 'Probaj ponovo ili unesi ručno', variant: 'destructive' })
    } finally {
      setScraping(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast({ title: 'Nedostaju podaci', description: 'Naziv, cena i kategorija su obavezni', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      price: parseFloat(form.price),
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
      stockQuantity: parseInt(form.stockQuantity),
      supplierUrl: form.supplierUrl || null,
      supplierPrice: form.supplierPrice ? parseFloat(form.supplierPrice) : null,
      variants: form.variants.map(v => ({ ...v, priceAdjust: parseFloat(v.priceAdjust) || 0, stock: parseInt(v.stock) || 0 })),
    }

    const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${initialData?.id}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast({ title: mode === 'create' ? '✓ Proizvod kreiran' : '✓ Izmene sačuvane', variant: 'success' })
      router.push('/admin/proizvodi')
    } else {
      const data = await res.json()
      toast({ title: 'Greška', description: data.error || 'Nije moguće sačuvati', variant: 'destructive' })
    }
    setSaving(false)
  }

  // Izračun marže
  const marzaInfo = (() => {
    const nabavna = parseFloat(form.supplierPrice)
    const prodajna = parseFloat(form.price)
    if (!nabavna || !prodajna || nabavna <= 0 || prodajna <= 0) return null
    const marza = prodajna - nabavna
    const pct = Math.round((marza / prodajna) * 100)
    const color = pct >= 30 ? 'text-emerald-400' : pct >= 15 ? 'text-amber-400' : 'text-red-400'
    const label = pct >= 30 ? '✓ Dobra' : pct >= 15 ? '⚠ Niska' : '✗ Premala'
    return { marza, pct, color, label }
  })()

  const tabs = [
    { key: 'basic', label: 'Osnovno' },
    { key: 'nabavka', label: 'Nabavka' },
    { key: 'images', label: `Slike (${form.images.length})` },
    { key: 'variants', label: `Varijante (${form.variants.length})` },
    { key: 'specs', label: `Spec. (${form.specifications.length})` },
    { key: 'seo', label: 'SEO' },
  ] as const

  const inp = "w-full bg-[#16161f] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FF4500]/40 transition-colors"
  const label = "text-xs text-white/40 mb-1.5 block uppercase tracking-wider"

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/admin/proizvodi')}
          className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white uppercase tracking-widest" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            {mode === 'create' ? 'Novi proizvod' : 'Uredi proizvod'}
          </h1>
          {mode === 'edit' && initialData?.name && (
            <p className="text-white/30 text-xs mt-0.5">{initialData.name}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-white/8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors uppercase tracking-wider border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-[#FF4500] border-[#FF4500]'
                : 'text-white/35 hover:text-white border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0D0D15] border border-white/6 rounded-xl p-6">

        {/* BASIC */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={label}>Naziv *</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Naziv proizvoda" className={inp} />
              </div>
              <div>
                <label className={label}>Cena prodajna (RSD) *</label>
                <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0" className={inp} />
              </div>
              <div>
                <label className={label}>Stara cena (RSD)</label>
                <input type="number" value={form.oldPrice} onChange={e => update('oldPrice', e.target.value)} placeholder="0" className={inp} />
              </div>
              <div>
                <label className={label}>Kategorija *</label>
                <select value={form.categoryId} onChange={e => update('categoryId', e.target.value)} className={inp}>
                  <option value="">Izaberi kategoriju</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Brend</label>
                <input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="Shoei, AGV, Alpinestars..." className={inp} />
              </div>
              <div>
                <label className={label}>SKU</label>
                <input value={form.sku} onChange={e => update('sku', e.target.value)} placeholder="SHO-GT-AIR-L" className={inp} />
              </div>
              <div>
                <label className={label}>Status zaliha</label>
                <select value={form.stockStatus} onChange={e => update('stockStatus', e.target.value)} className={inp}>
                  {STOCK_STATUSES.map(s => <option key={s.value} value={s.value} className="bg-gray-900">{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Količina na stanju</label>
                <input type="number" value={form.stockQuantity} onChange={e => update('stockQuantity', e.target.value)} className={inp} />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Kratki opis</label>
                <textarea value={form.shortDescription} onChange={e => update('shortDescription', e.target.value)} rows={2} placeholder="Kratki opis proizvoda..." className={`${inp} resize-none`} />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Opis</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={5} placeholder="Detaljan opis proizvoda..." className={`${inp} resize-none`} />
              </div>
            </div>
            <div className="flex gap-6 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => update('isActive', e.target.checked)} className="w-4 h-4 accent-[#FF4500]" />
                <span className="text-sm text-white/70">Aktivan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => update('isFeatured', e.target.checked)} className="w-4 h-4 accent-[#FF4500]" />
                <span className="text-sm text-white/70">⭐ Prikaži na naslovnoj</span>
              </label>
            </div>
          </div>
        )}

        {/* NABAVKA */}
        {activeTab === 'nabavka' && (
          <div className="space-y-6">
            <div>
              <label className={label}>🔗 Link dobavljača (nemački sajt)</label>
              <input
                value={form.supplierUrl}
                onChange={e => update('supplierUrl', e.target.value)}
                placeholder="https://www.polo-motorrad.de/..."
                className={inp}
              />
              {form.supplierUrl && (
                <a
                  href={form.supplierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#FF4500] hover:text-white transition-colors"
                >
                  <Link2 size={11} /> Otvori link →
                </a>
              )}

              {/* Povuci podatke sa URL-a */}
              <button
                type="button"
                onClick={scrapeFromUrl}
                disabled={scraping || !form.supplierUrl.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#FF4500]/40 bg-[#FF4500]/10 text-[#FF4500] text-sm font-medium hover:bg-[#FF4500]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {scraping ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Povlačim podatke...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Povuci podatke sa linka
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-white/30 leading-relaxed">
                Automatski popunjava naziv, opis, brend, cenu i slike sa stranice dobavljača.
                Pregledaj i doteraj pre čuvanja. Ako sajt blokira, unesi ručno.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>💶 Cena uvoza (EUR)</label>
                <input
                  type="number"
                  value={form.supplierPriceEur}
                  onChange={e => {
                    const eur = e.target.value
                    update('supplierPriceEur', eur)
                    if (eur && parseFloat(eur) > 0) {
                      update('supplierPrice', String(Math.round(parseFloat(eur) * 117)))
                    }
                  }}
                  placeholder="0.00"
                  className={inp}
                />
                {form.supplierPriceEur && parseFloat(form.supplierPriceEur) > 0 && (
                  <p className="text-xs text-white/25 mt-1">
                    ≈ {new Intl.NumberFormat('sr-RS').format(Math.round(parseFloat(form.supplierPriceEur) * 117))} RSD
                    <span className="ml-1.5 opacity-60">(kurs 1€ = 117 RSD)</span>
                  </p>
                )}
              </div>

              <div>
                <label className={label}>💰 Nabavna cena (RSD)</label>
                <input
                  type="number"
                  value={form.supplierPrice}
                  onChange={e => update('supplierPrice', e.target.value)}
                  placeholder="0"
                  className={inp}
                />
                {marzaInfo && (
                  <div className={`mt-1.5 text-xs font-medium ${marzaInfo.color} flex items-center gap-3`}>
                    <span>Marža: {new Intl.NumberFormat('sr-RS').format(marzaInfo.marza)} RSD</span>
                    <span className="opacity-70">({marzaInfo.pct}%)</span>
                    <span className="opacity-60">{marzaInfo.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Marža vizuelna */}
            {marzaInfo && (
              <div className="bg-white/3 border border-white/6 rounded-xl p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Pregled marže</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-white/30 mb-1">Nabavna</p>
                    <p className="text-white font-medium">{new Intl.NumberFormat('sr-RS').format(parseFloat(form.supplierPrice))} RSD</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">Prodajna</p>
                    <p className="text-white font-medium">{new Intl.NumberFormat('sr-RS').format(parseFloat(form.price))} RSD</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">Marža</p>
                    <p className={`font-semibold ${marzaInfo.color}`}>{marzaInfo.pct}%</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${marzaInfo.pct >= 30 ? 'bg-emerald-400' : marzaInfo.pct >= 15 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(marzaInfo.pct, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* IMAGES */}
        {activeTab === 'images' && (
          <div className="space-y-5">
            {/* Upload dugmad */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Sa kompa */}
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                uploading
                  ? 'border-white/20 text-white/30'
                  : 'border-[#FF4500]/30 text-[#FF4500] hover:border-[#FF4500]/60 hover:bg-[#FF4500]/5'
              }`}>
                <Upload size={16} />
                <span className="text-sm font-medium">{uploading ? 'Uploadovanje...' : 'Upload sa kompa'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>

              {/* Po URL-u */}
              <div className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddByUrl()}
                    placeholder="https://... (Enter ili +)"
                    className={`${inp} pl-8`}
                  />
                </div>
                <button
                  onClick={handleAddByUrl}
                  disabled={!urlInput.trim()}
                  className="px-4 py-2.5 bg-white/6 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm transition-colors disabled:opacity-30 flex items-center gap-1"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Grid slika */}
            {form.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/6">
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#FF4500] text-white text-[10px] font-medium px-1.5 py-0.5 rounded">Glavna</span>
                    )}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white/60 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/20">
                <ImageIcon size={32} className="mb-2" />
                <p className="text-sm">Nema slika. Uploadujte ili dodajte URL.</p>
              </div>
            )}

            <p className="text-xs text-white/25">Prva slika je glavna. Max 5MB po slici za upload.</p>
          </div>
        )}

        {/* VARIANTS */}
        {activeTab === 'variants' && (
          <div className="space-y-3">
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 p-3 bg-white/3 border border-white/6 rounded-xl">
                <select value={v.type} onChange={e => updateVariant(i, 'type', e.target.value)} className={`${inp} text-xs`}>
                  {VARIANT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>)}
                </select>
                <input value={v.value} onChange={e => updateVariant(i, 'value', e.target.value)} placeholder="npr. L, XL, Crvena" className={`${inp} text-xs`} />
                <div className="flex gap-1.5">
                  <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} placeholder="Kom" className={`${inp} text-xs flex-1`} />
                  <button onClick={() => removeVariant(i)} className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {form.variants.length === 0 && (
              <p className="text-center text-white/25 text-sm py-6">Nema varijanti. Dodajte veličine, boje itd.</p>
            )}
            <button onClick={addVariant} className="flex items-center gap-2 text-sm text-[#FF4500]/70 hover:text-[#FF4500] transition-colors">
              <Plus className="w-4 h-4" /> Dodaj varijantu
            </button>
          </div>
        )}

        {/* SPECS */}
        {activeTab === 'specs' && (
          <div className="space-y-3">
            {form.specifications.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={s.label} onChange={e => updateSpec(i, 'label', e.target.value)} placeholder="Naziv (npr. Težina)" className={`${inp} flex-1`} />
                <input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="Vrednost (npr. 1.5 kg)" className={`${inp} flex-1`} />
                <button onClick={() => removeSpec(i)} className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {form.specifications.length === 0 && (
              <p className="text-center text-white/25 text-sm py-6">Nema specifikacija. Dodajte tehničke detalje.</p>
            )}
            <button onClick={addSpec} className="flex items-center gap-2 text-sm text-[#FF4500]/70 hover:text-[#FF4500] transition-colors">
              <Plus className="w-4 h-4" /> Dodaj specifikaciju
            </button>
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div>
              <label className={label}>Meta naslov</label>
              <input value={form.metaTitle} onChange={e => update('metaTitle', e.target.value)} placeholder="SEO naslov..." className={inp} />
              <p className="text-xs text-white/20 mt-1">{form.metaTitle.length} / 60 karaktera</p>
            </div>
            <div>
              <label className={label}>Meta opis</label>
              <textarea value={form.metaDescription} onChange={e => update('metaDescription', e.target.value)} rows={3} placeholder="SEO opis..." className={`${inp} resize-none`} />
              <p className="text-xs text-white/20 mt-1">{form.metaDescription.length} / 160 karaktera</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button onClick={() => router.push('/admin/proizvodi')} className="px-5 py-2.5 text-sm text-white/40 hover:text-white transition-colors">
          Otkaži
        </button>
        <button onClick={handleSubmit} disabled={saving} className="btn-moto px-6 py-2.5 rounded-lg text-sm disabled:opacity-50">
          {saving ? 'Čuvanje...' : mode === 'create' ? 'Kreiraj proizvod' : 'Sačuvaj izmene'}
        </button>
      </div>
    </div>
  )
}
