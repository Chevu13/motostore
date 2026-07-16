'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight, Shield, Zap, Truck } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background - premium motorcycle lifestyle shot */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1920&q=90"
          alt="Motociklista na putu"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay - stronger on left for text, transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B10] via-[#0B0B10]/80 to-[#0B0B10]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B10] via-transparent to-[#0B0B10]/20" />
        {/* Orange accent glow */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[#FF4B1F]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-[#FF4B1F]/8 blur-[100px] rounded-full pointer-events-none" />
        {/* Brand signature: acceleration stripes — suptilne kose linije udesno */}
        <svg
          className="absolute right-0 top-0 h-full w-auto opacity-[0.07] pointer-events-none hidden lg:block"
          viewBox="0 0 400 800"
          fill="none"
          aria-hidden="true"
        >
          <path d="M120 800 L180 800 L300 200 L240 200 Z" fill="#FF4B1F" />
          <path d="M220 800 L280 800 L420 100 L360 100 Z" fill="#FF4B1F" />
          <path d="M20 800 L80 800 L180 320 L120 320 Z" fill="#F6F4F1" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-bold uppercase tracking-widest text-moto-orange border border-moto-orange/30 mb-6">
              <span className="w-1.5 h-1.5 bg-moto-orange rounded-full animate-pulse" />
              Premium moto oprema · Srbija
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black uppercase leading-[0.95] mb-6"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '-0.015em' }}
          >
            <span className="text-white">Opremi se.</span>
            <br />
            <span className="gradient-text">Vozi slobodno.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg mb-10 leading-relaxed max-w-xl"
          >
            Kacige, jakne, pantalone i čizme vrhunskih svetskih brendova.
            Sigurna vožnja počinje kvalitetnom opremom. Dostava na kućnu adresu, plaćanje pouzećem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-14"
          >
            <Link href="/store/kategorija/kacige" className="btn-moto text-sm px-6 py-3 flex items-center gap-2">
              Istraži opremu <ChevronRight size={16} />
            </Link>
            <Link href="/store/kategorija/jakne" className="btn-outline-moto text-sm px-6 py-3">
              Jakne i zaštita
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { icon: Shield, label: 'CE sertifikovana oprema', sub: 'zaštita po EU standardima' },
              { icon: Truck, label: 'Dostava 7–14 dana', sub: 'na kućnu adresu' },
              { icon: Zap, label: 'Pouzeće', sub: 'bez online plaćanja' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 glass px-4 py-3 rounded-xl border border-white/5">
                <Icon size={18} className="text-moto-orange flex-shrink-0" />
                <div>
                  <p className="text-white text-xs font-bold">{label}</p>
                  <p className="text-gray-500 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
      >
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-moto-orange" />
        <div className="w-1.5 h-1.5 bg-moto-orange rounded-full" />
      </motion.div>
    </section>
  )
}
