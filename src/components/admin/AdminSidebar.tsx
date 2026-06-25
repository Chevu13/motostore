'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings, LogOut, Menu, X, BarChart3 } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Pregled' },
  { href: '/admin/porudzbine', icon: ShoppingBag, label: 'Porudžbine' },
  { href: '/admin/proizvodi', icon: Package, label: 'Proizvodi' },
  { href: '/admin/kategorije', icon: Tag, label: 'Kategorije' },
  { href: '/admin/analitika', icon: BarChart3, label: 'Analitika' },
  { href: '/admin/podesavanja', icon: Settings, label: 'Podešavanja' },
]

export default function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/admin/dashboard">
          <p className="text-white text-xl font-semibold uppercase tracking-widest" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Moto<span className="text-[#FF4500]">Store</span><span className="text-white/30">.rs</span>
          </p>
          <p className="text-[10px] tracking-[2px] uppercase text-white/25 mt-0.5">Admin panel</p>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (pathname.startsWith(href + '/') && href !== '/admin')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors border ${
                active
                  ? 'bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/20'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-2">
        <Link
          href="/store"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/25 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Otvori sajt
        </Link>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[#FF4500] text-sm font-bold">{adminEmail[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{adminEmail}</p>
            <p className="text-white/25 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white/30 hover:text-red-400 border border-white/8 hover:border-red-500/30 rounded-lg transition-all"
        >
          <LogOut size={12} /> Odjava
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-60 flex-col min-h-screen sticky top-0 bg-[#0A0A0F] border-r border-white/5">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 bg-[#0A0A0F] border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-60 bg-[#0A0A0F] border-r border-white/10 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}
