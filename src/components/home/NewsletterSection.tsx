'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Check } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setDone(true); setEmail('') }
  }

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'var(--bg-2)' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent" />
      <div className="absolute inset-0 opacity-20"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(230,57,70,0.1) 0%, transparent 60%)' }} />

      <div className="relative container mx-auto px-4 max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(255,69,0,0.12)', border: '1px solid rgba(255,69,0,0.2)' }}>
            <Mail size={26} className="text-orange-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Budi prvi koji sazna<br />
            <span className="gradient-text">za nove akcije</span>
          </h2>
          <p className="text-white/40 font-light mb-8">
            Pretplati se i dobijaj ekskluzivne popuste i informacije o novim proizvodima.
          </p>

          {done ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 text-[#3FAE6A] font-semibold"
            >
              <div className="w-8 h-8 rounded-full bg-[#3FAE6A]/20 flex items-center justify-center">
                <Check size={16} />
              </div>
              Hvala! Prijaćemo te na listu.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tvoj@email.com"
                required
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <button type="submit" className="btn-moto px-5 py-3.5 rounded-xl text-sm flex-shrink-0">
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          <p className="text-white/20 text-xs mt-4 font-light">Bez spama. Odjava u bilo kom trenutku.</p>
        </motion.div>
      </div>
    </section>
  )
}
