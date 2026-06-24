'use client'

import { motion } from 'framer-motion'
import { Package, CheckCircle, Truck, MapPin } from 'lucide-react'
import Link from 'next/link'

const steps = [
  { icon: Package, label: 'Naručite online', sub: 'Brzo i jednostavno' },
  { icon: CheckCircle, label: 'Potvrdimo narudžbu', sub: 'U roku od 24h' },
  { icon: Truck, label: 'Šaljemo paket', sub: 'Kurirom do vas' },
  { icon: MapPin, label: 'Plaćate pri preuzimanju', sub: 'Pouzećem na vašoj adresi' },
]

export default function DeliveryBanner() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #0F0A08 0%, #150A05 50%, #0F0808 100%)'
      }} />
      <div className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(255,69,0,0.12) 0%, transparent 60%)' }} />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="badge-orange inline-flex mb-5">Kako naručiti</div>
          <h2 className="text-5xl md:text-6xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            <span className="gradient-text">Pouzeće</span> — bez rizika
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto font-light">
            Plaćate tek kad vidite paket. Nema online plaćanja, nema rizika.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-orange-500/15"
              style={{ background: 'rgba(255,69,0,0.04)' }}
            >
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                style={{ background: 'linear-gradient(135deg,#FF4500,#CC2200)' }}>
                {i + 1}
              </div>

              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mt-2"
                style={{ background: 'rgba(255,69,0,0.12)', border: '1px solid rgba(255,69,0,0.2)' }}>
                <step.icon size={22} className="text-orange-400" />
              </div>
              <h3 className="text-white font-bold text-[16px] mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                {step.label}
              </h3>
              <p className="text-white/35 text-xs font-light">{step.sub}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/store" className="btn-moto px-8 py-3.5 text-sm">
            Naruči odmah
          </Link>
          <Link href="/store/pracenje" className="btn-outline-moto px-8 py-3.5 text-sm">
            Prati porudžbinu
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
