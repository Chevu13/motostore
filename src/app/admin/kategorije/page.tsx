'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  sortOrder: number
  isActive: boolean
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const fetchCats = async () => {
    const res = await fetch('/api/admin/categories')
    if (res.ok) {
      const data = await res.json()
      setCategories(data.categories)
    }
    setLoading(false)
  }

  useEffect(() => { fetchCats() }, [])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc }),
    })
    if (res.ok) {
      setNewName('')
      setNewDesc('')
      setShowAdd(false)
      fetchCats()
      toast({ title: 'Kategorija kreirana', variant: 'success' })
    } else {
      const d = await res.json()
      toast({ title: 'Greška', description: d.error, variant: 'destructive' })
    }
    setAdding(false)
  }

  const handleEdit = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, description: editDesc }),
    })
    if (res.ok) {
      setEditingId(null)
      fetchCats()
      toast({ title: 'Sačuvano', variant: 'success' })
    } else {
      toast({ title: 'Greška', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Obrisati kategoriju "${name}"?`)) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchCats()
      toast({ title: 'Obrisano', variant: 'success' })
    } else {
      const d = await res.json()
      toast({ title: 'Greška', description: d.error, variant: 'destructive' })
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDesc(cat.description || '')
  }

  const inputCls = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kategorije</h1>
          <p className="text-white/50 text-sm mt-1">{categories.length} kategorija</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-moto px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova kategorija
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass rounded-xl p-4 mb-6">
          <h2 className="text-white font-medium mb-3">Nova kategorija</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Naziv kategorije"
              className={`${inputCls} flex-1`}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <input
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Opis (opciono)"
              className={`${inputCls} flex-1`}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="btn-moto px-4 py-2 rounded-lg text-sm disabled:opacity-50 whitespace-nowrap"
            >
              {adding ? 'Dodavanje...' : 'Dodaj'}
            </button>
            <button onClick={() => setShowAdd(false)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider">Naziv</th>
                <th className="text-left text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-center text-xs text-white/40 font-medium px-4 py-3 uppercase tracking-wider">Proizvodi</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    {editingId === cat.id ? (
                      <div className="flex gap-2">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className={`${inputCls} flex-1`}
                          autoFocus
                        />
                        <input
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          placeholder="Opis"
                          className={`${inputCls} flex-1 hidden sm:block`}
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-white font-medium">{cat.name}</p>
                        {cat.description && <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{cat.description}</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-mono text-xs text-white/40">{cat.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-white/60">{cat._count.products}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === cat.id ? (
                        <>
                          <button onClick={() => handleEdit(cat.id)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            disabled={cat._count.products > 0}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                            title={cat._count.products > 0 ? 'Premestite ili obrišite proizvode prvo' : 'Obriši'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
