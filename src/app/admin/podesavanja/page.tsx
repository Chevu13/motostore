'use client'

import { useState } from 'react'
import { Save, Store, Mail, Truck, Info } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function AdminPodesavanjaPage() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    storeName: 'MotoStore.rs',
    storeEmail: 'info@motostore.rs',
    storePhone: '+381 11 123 4567',
    storeAddress: 'Beograd, Srbija',
    freeShippingThreshold: '15000',
    shippingCost: '390',
    adminEmail: 'admin@motostore.rs',
  })

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    // In production: POST /api/admin/settings
    await new Promise(r => setTimeout(r, 800))
    toast({ title: 'Podešavanja sačuvana', variant: 'success' })
    setSaving(false)
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="glass rounded-xl p-5">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-orange-400" />
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Podešavanja</h1>
        <p className="text-white/50 text-sm mt-1">Opšta podešavanja prodavnice</p>
      </div>

      <div className="space-y-6">
        <Section icon={Store} title="Informacije o prodavnici">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Naziv prodavnice</label>
            <input value={settings.storeName} onChange={e => update('storeName', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Telefon</label>
              <input value={settings.storePhone} onChange={e => update('storePhone', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Adresa</label>
              <input value={settings.storeAddress} onChange={e => update('storeAddress', e.target.value)} className={inputCls} />
            </div>
          </div>
        </Section>

        <Section icon={Mail} title="Email podešavanja">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Email prodavnice (prikazuje se kupcima)</label>
            <input type="email" value={settings.storeEmail} onChange={e => update('storeEmail', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Admin email (prima obaveštenja)</label>
            <input type="email" value={settings.adminEmail} onChange={e => update('adminEmail', e.target.value)} className={inputCls} />
          </div>
        </Section>

        <Section icon={Truck} title="Dostava i plaćanje">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Cena dostave (RSD)</label>
              <input type="number" value={settings.shippingCost} onChange={e => update('shippingCost', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Besplatna dostava od (RSD)</label>
              <input type="number" value={settings.freeShippingThreshold} onChange={e => update('freeShippingThreshold', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 flex gap-2">
            <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/50">
              Jedini način plaćanja je <strong className="text-white/70">pouzeće (cash on delivery)</strong>. Kupac plaća kuriru pri preuzimanju paketa.
            </p>
          </div>
        </Section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-moto px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
          </button>
        </div>
      </div>
    </div>
  )
}
