'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Marko Jovanović',
    city: 'Beograd',
    rating: 5,
    date: 'Mart 2025',
    product: 'Shoei GT-Air 3',
    text: 'Kaciga stigla za 3 dana, pakovanje perfektno. Kvalitet je odličan, tačno onakva kao na slikama. Pouzeće je bilo super, nisam morao ništa unapred da platim. Preporučujem svima!',
    avatar: 'MJ',
    color: '#FF4B1F',
  },
  {
    name: 'Stefan Nikolić',
    city: 'Novi Sad',
    rating: 5,
    date: 'April 2025',
    product: 'Alpinestars Andes V3 Jakna',
    text: 'Naručio sam jaknu, stigla brzo i odgovara veličini. Materijal je premium, vodootporna membrana radi odlično. Kurir je bio ljubazan. Definitivno kupujem ponovo!',
    avatar: 'SN',
    color: '#E5484D',
  },
  {
    name: 'Ana Petrović',
    city: 'Niš',
    rating: 5,
    date: 'April 2025',
    product: 'Sidi Adventure 2 Čizme',
    text: 'Konačno sam pronašla pouzdanu prodavnicu za moto opremu u Srbiji! Čizme su fantastične, Gore-Tex stvarno drži vodu napolje. Isporuka super, plaćanje pouzećem je ogromna prednost.',
    avatar: 'AP',
    color: '#FF4B1F',
  },
  {
    name: 'Nikola Đorđević',
    city: 'Kragujevac',
    rating: 5,
    date: 'Maj 2025',
    product: 'AGV K6 S Kaciga',
    text: 'Odlična usluga! Poručio sam u ponedeljak, stiglo u sredu. Kaciga je autentična, ima sve papire i CE sertifikat. Cena je povoljnija nego u radnjama. 10/10!',
    avatar: 'NĐ',
    color: '#E5484D',
  },
  {
    name: 'Milica Stojanović',
    city: 'Subotica',
    rating: 5,
    date: 'Maj 2025',
    product: 'Alpinestars Andes Pantalone',
    text: 'Pantalone su tačno onakve kao što je opisano. Sjajne za touring, koža je kvalitetna. Jako sam zadovoljna kupovinom, tim je bio ljubazan i odgovorio na sva pitanja.',
    avatar: 'MS',
    color: '#FF4B1F',
  },
  {
    name: 'Dragan Vasić',
    city: 'Čačak',
    rating: 5,
    date: 'Maj 2025',
    product: 'Dainese Smart Jacket',
    text: 'Airbag jakna je pravo čudo tehnologije. Stigla brzo, sve je bilo kako treba. MotoStore.rs je jedino mesto gde sam mogao da nađem ovaj model u Srbiji. Vrhunska usluga!',
    avatar: 'DV',
    color: '#E5484D',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-2)' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse, rgba(230,57,70,0.04), transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5 text-[11px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,75,31,0.08)', borderColor: 'rgba(255,75,31,0.2)', color: '#FF4B1F' }}>
            <Star size={11} fill="currentColor" />
            Utisci kupaca
          </div>
          <h2 className="font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif', fontSize: 'clamp(36px, 5vw, 52px)', lineHeight: 1 }}>
            Šta kažu naši <span className="gradient-text">vozači</span>
          </h2>
          <p className="text-white/35 mt-3 font-light">Preko 200+ zadovoljnih kupaca iz cele Srbije</p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative p-6 rounded-2xl border border-white/[0.06] group hover:border-orange-500/15 transition-all duration-300"
              style={{ background: 'var(--bg-3)' }}
            >
              {/* Quote icon */}
              <Quote size={32} className="absolute top-5 right-5 opacity-[0.06]" style={{ color: t.color }} />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} fill="#FF4B1F" style={{ color: '#FF4B1F' }} />
                ))}
              </div>

              {/* Text */}
              <p className="text-white/55 text-[14px] leading-relaxed mb-5 font-light">
                "{t.text}"
              </p>

              {/* Product */}
              <div className="text-[11px] font-bold uppercase tracking-widest mb-4 px-2.5 py-1 rounded-lg inline-block"
                style={{ background: `${t.color}12`, color: t.color, border: `1px solid ${t.color}25` }}>
                {t.product}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.city} · {t.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-10 mt-14"
        >
          {[
            { value: '200+', label: 'Zadovoljnih kupaca' },
            { value: '4.9/5', label: 'Prosečna ocena' },
            { value: '98%', label: 'Preporučuju nas' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-black gradient-text" style={{ fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif', fontSize: '40px' }}>
                {stat.value}
              </p>
              <p className="text-white/35 text-sm font-light">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
