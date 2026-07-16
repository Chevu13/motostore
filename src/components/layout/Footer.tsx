import Logo from '@/components/ui/Logo'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#060610', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo variant="full" scheme="dark" size={28} />
            </div>
            <p className="text-white/35 text-sm leading-relaxed font-light max-w-xs">
              Premium moto oprema za ozbiljne vozače. Originalni brendovi, brza dostava, plaćanje pouzećem.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://instagram.com/motostore.rs" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/[0.08] transition-colors border border-white/[0.07] group" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{color:'rgba(255,255,255,0.4)'}} className="group-hover:!text-white transition-colors">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://facebook.com/motostore.rs" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/[0.08] transition-colors border border-white/[0.07] group" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color:'rgba(255,255,255,0.4)'}} className="group-hover:!text-white transition-colors">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://wa.me/381611234567" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/[0.08] transition-colors border border-white/[0.07] group" aria-label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" style={{color:'rgba(255,255,255,0.4)'}} className="group-hover:!text-white transition-colors">
                  <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.77 1.84 6.76L2 30l7.5-1.96A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.65l-.43-.26-4.44 1.16 1.18-4.32-.28-.45A11.47 11.47 0 0 1 4.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.29-8.67c-.34-.17-2.03-1-2.34-1.12-.31-.11-.54-.17-.77.17-.23.34-.88 1.12-1.08 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.75-1.7-1.01-.9-1.7-2.02-1.9-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.54-.28-.66-.56-.57-.77-.58-.2-.01-.43-.01-.65-.01s-.6.09-.91.43c-.31.34-1.2 1.17-1.2 2.85s1.23 3.31 1.4 3.54c.17.23 2.42 3.69 5.86 5.17.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.03-.83 2.31-1.63.28-.8.28-1.49.2-1.63-.08-.14-.31-.23-.65-.4z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Kategorije */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5 opacity-60">Kategorije</h4>
            <ul className="space-y-3">
              {[
                { name: 'Kacige', slug: 'kacige' },
                { name: 'Jakne', slug: 'jakne' },
                { name: 'Pantalone', slug: 'pantalone' },
                { name: 'Čizme', slug: 'cizme' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/store/kategorija/${cat.slug}`}
                    className="text-white/35 hover:text-orange-400 text-sm font-light transition-colors duration-200">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5 opacity-60">Info</h4>
            <ul className="space-y-3">
              {[
                { label: 'Praćenje porudžbine', href: '/store/pracenje' },
                { label: 'Dostava i plaćanje', href: '/store' },
                { label: 'Povraćaj robe', href: '/store' },
                { label: 'Kontakt', href: '/store' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href}
                    className="text-white/35 hover:text-orange-400 text-sm font-light transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-light">
            © 2026 MotoStore.rs — Sva prava zadržana
          </p>
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'COD'].map((method) => (
              <div key={method} className="px-2.5 py-1 rounded-lg border border-white/[0.07] text-white/25 text-[10px] font-bold tracking-wider">
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
