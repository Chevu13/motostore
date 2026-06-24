'use client'

import { motion } from 'framer-motion'
import { Shield, Truck, CreditCard, Headphones, Award, RotateCcw } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'CE Sertifikovano',
    desc: 'Sva zaštitna oprema ispunjava EU standarde. Vaša bezbednost je prioritet.',
    color: '#FF4500',
  },
  {
    icon: Truck,
    title: 'Brza dostava',
    desc: 'Isporuka 2–5 radnih dana. Besplatno za narudžbine preko 15.000 RSD.',
    color: '#FF6B35',
  },
  {
    icon: CreditCard,
    title: 'Pouzeće',
    desc: 'Plaćate kuriru pri preuzimanju. Nema online plaćanja, nema rizika.',
    color: '#E63946',
  },
  {
    icon: Headphones,
    title: 'Podrška 7/7',
    desc: 'Naš tim je tu za vas svaki dan. Pozovite ili pišite u bilo kom trenutku.',
    color: '#FF4500',
  },
  {
    icon: Award,
    title: 'Originalni brendovi',
    desc: 'Shoei, AGV, Alpinestars, Dainese — samo originalni proizvodi sa garancijom.',
    color: '#FF6B35',
  },
  {
    icon: RotateCcw,
    title: 'Povraćaj robe',
    desc: '14 dana za povraćaj bez pitanja. Vaše zadovoljstvo je naša garancija.',
    color: '#E63946',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-2)' }}>
      {/* Decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="badge-orange inline-flex mb-5">Zašto MotoStore?</div>
          <h2 className="text-5xl md:text-6xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Vaša bezbednost,<br />
            <span className="gradient-text">naš prioritet</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative p-6 rounded-2xl border border-white/[0.06] hover:border-orange-500/20 transition-all duration-400"
              style={{ background: 'var(--bg-3)' }}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(ellipse at top left, ${f.color}08 0%, transparent 60%)` }} />

              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '20px' }}>
                  {f.title}
                </h3>
                <p className="text-white/45 text-sm leading-relaxed font-light">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
