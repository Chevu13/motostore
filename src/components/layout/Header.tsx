'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, Search, ChevronDown, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/cart-store'
import { useRouter } from 'next/navigation'

const categories = [
  { name: 'Kacige', slug: 'kacige', icon: '🪖' },
  { name: 'Jakne', slug: 'jakne', icon: '🧥' },
  { name: 'Pantalone', slug: 'pantalone', icon: '👖' },
  { name: 'Čizme', slug: 'cizme', icon: '🥾' },
  { name: 'Rukavice', slug: 'rukavice', icon: '🧤' },
  { name: 'Zaštita', slug: 'zastita', icon: '🛡️' },
  { name: 'Koferi i prtljag', slug: 'koferi-prtljag', icon: '🎒' },
  { name: 'Moto oprema', slug: 'moto-oprema', icon: '🏍️' },
  { name: 'Interkomi', slug: 'interkomi', icon: '🎧' },
  { name: 'Navigacija', slug: 'navigacija', icon: '🗺️' },
  { name: 'Kišna oprema', slug: 'kisna-oprema', icon: '🌧️' },
  { name: 'Održavanje', slug: 'odrzavanje', icon: '🔧' },
  { name: 'Delovi', slug: 'delovi', icon: '⚙️' },
  { name: 'Lifestyle', slug: 'lifestyle', icon: '👕' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const totalItems = useCartStore((s) => s.totalItems())
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/store/pretraga?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[#FF4500] via-[#CC2200] to-[#E63946] text-white text-center py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)] animate-shimmer" />
        <span className="relative flex items-center justify-center gap-3">
          <Zap size={11} className="opacity-80" />
          Besplatna dostava za narudžbine preko 15.000 RSD · Plaćanje pouzećem
          <Zap size={11} className="opacity-80" />
        </span>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#08080E]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-[#08080E]'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link href="/store" className="flex items-center gap-0 group flex-shrink-0">
              <span className="text-[26px] font-black uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '-0.01em' }}>
                <span className="gradient-text">Moto</span>
                <span className="text-white">Store</span>
                <span style={{ color: '#FF4500', opacity: 0.7 }}>.rs</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <div
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/60 hover:text-white transition-colors duration-200">
                  Kategorije
                  <ChevronDown size={13} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[420px] glass-dark rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/[0.08]"
                    >
                      <div className="p-2 grid grid-cols-2 gap-0">
                        {categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/store/kategorija/${cat.slug}`}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150 group"
                          >
                            <span className="text-sm">{cat.icon}</span>
                            <span className="font-medium tracking-wide text-xs">{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-white/[0.06] p-2">
                        <Link href="/store" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-orange-400 hover:bg-orange-500/10 transition-colors duration-150">
                          Svi proizvodi →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/store/pracenje" className="text-[13px] font-semibold uppercase tracking-[0.1em] text-white/60 hover:text-white transition-colors duration-200">
                Praćenje pošiljke
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <AnimatePresence>
                {searchOpen ? (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handleSearch}
                    className="overflow-hidden"
                  >
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Pretraži..."
                      className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
                    />
                  </motion.form>
                ) : null}
              </AnimatePresence>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {/* Cart */}
              <Link
                href="/store/korpa"
                className="relative p-2.5 text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200"
              >
                <ShoppingCart size={18} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(255,69,0,0.5)]"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Mobile menu btn */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden sticky top-[104px] z-40 glass-dark border-b border-white/[0.06] overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/store/kategorija/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <span>{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-white/[0.06]">
                <Link href="/store/pracenje" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all">
                  <span>📦</span>
                  <span className="font-medium">Praćenje porudžbine</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
