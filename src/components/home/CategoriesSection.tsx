'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    name: 'Kacige',
    slug: 'kacige',
    subtitle: 'Integralne · Modularni · Jet',
    image: '/images/categories/kaciga.jpg',
    badge: 'Bestseler',
    badgeColor: '#FF4500',
    bgPos: 'center center',
  },
  {
    name: 'Jakne',
    slug: 'jakne',
    subtitle: 'Kožne · Tekstilne · Adventure',
    image: '/images/categories/jakna.jpg',
    badge: 'Novo',
    badgeColor: '#E63946',
    bgPos: 'center top',
  },
  {
    name: 'Pantalone',
    slug: 'pantalone',
    subtitle: 'Touring · Sport · Adventure',
    image: '/images/categories/pantalona.jpg',
    badge: null,
    badgeColor: '#FF4500',
    bgPos: 'center center',
  },
  {
    name: 'Čizme',
    slug: 'cizme',
    subtitle: 'Touring · Urban · Sport',
    image: '/images/categories/cizme.jpg',
    badge: 'Gore-Tex',
    badgeColor: '#FF4500',
    bgPos: 'center center',
  },
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function CategoriesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <section ref={ref} className="py-20 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient glow */}
      <motion.div
        style={{ y }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        aria-hidden="true"
      >
        <div style={{ background: 'radial-gradient(ellipse, rgba(255,69,0,0.05) 0%, transparent 70%)', width: '100%', height: '100%' }} />
      </motion.div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xs font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: '#FF4500' }}
            >
              Kategorije
            </motion.p>
            <h2
              className="font-black uppercase text-white"
              style={{
                fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif',
                fontSize: 'clamp(36px, 5vw, 52px)',
                lineHeight: 1,
              }}
            >
              Sva oprema<br />
              <span className="gradient-text">na jednom mestu</span>
            </h2>
          </div>
          <Link
            href="/store"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors duration-200 group"
            style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}
          >
            <span className="group-hover:text-orange-400 transition-colors">Svi proizvodi</span>
            <ArrowRight className="w-4 h-4 group-hover:text-orange-400 group-hover:translate-x-1 transition-all duration-200" />
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.slug} variants={cardVariant}>
              <Link
                href={`/store/kategorija/${cat.slug}`}
                className="group relative block overflow-hidden rounded-2xl"
                style={{ aspectRatio: '3/4' }}
              >
                {/* Image with parallax scale */}
                <div className="absolute inset-0" style={{ background: '#1a1a2e' }}>
                  <motion.img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: cat.bgPos }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>

                {/* Gradient */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)' }}
                />

                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at center bottom, ${cat.badgeColor}20 0%, transparent 65%)` }}
                />

                {/* Badge */}
                {cat.badge && (
                  <motion.div
                    className="absolute top-3 left-3 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                      style={{ background: cat.badgeColor }}
                    >
                      {cat.badge}
                    </span>
                  </motion.div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {cat.subtitle}
                  </p>
                  <h3
                    className="font-black uppercase text-white leading-none transition-colors duration-300 group-hover:text-orange-400"
                    style={{
                      fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif',
                      fontSize: 'clamp(26px, 3vw, 32px)',
                    }}
                  >
                    {cat.name}
                  </h3>

                  <motion.div
                    className="flex items-center gap-1.5 mt-3"
                    initial={{ opacity: 0, y: 6 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    style={{ color: '#FF4500' }}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Pogledaj
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
                  </motion.div>
                </div>

                {/* Border glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-500/30 transition-all duration-500 pointer-events-none"
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
