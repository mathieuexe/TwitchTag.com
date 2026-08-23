'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Twitch, Menu, X, Crown, ShieldAlert, User } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Générateur' },
    { href: '/verifier', label: 'Vérificateur' },
    { href: '/donation', label: 'Soutenir' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* Top Purple Bar */}
      <div className="bg-twitch-purple text-white px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center relative">
            <Twitch className="w-8 h-8 text-white z-10" />
            <div className="absolute -inset-1 bg-black/20 rounded-full blur-sm -z-0"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight uppercase leading-none">
              GG Pseudo Gen
            </span>
            <span className="text-xs text-white/80">
              Générateur de Pseudo Gaming
            </span>
          </div>
        </Link>

        {/* Auth / Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/admin" className="text-sm font-semibold hover:bg-white/10 px-3 py-1.5 rounded transition-colors">
            SE CONNECTER
          </Link>
          <Link href="/admin" className="text-sm font-semibold bg-white text-twitch-purple hover:bg-gray-100 px-4 py-1.5 rounded transition-colors">
            S'INSCRIRE
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 text-white hover:bg-white/10 rounded transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sub Navigation (Dark Bar) */}
      <div className="bg-bg-secondary border-b border-white/10 px-4 sm:px-6 lg:px-8 h-12 flex items-center overflow-x-auto hide-scrollbar">
        <nav className="flex items-center gap-6 text-sm font-semibold tracking-wide">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap transition-colors uppercase ${
                isActive(item.href)
                  ? 'text-twitch-purple'
                  : 'text-text-primary hover:text-twitch-purple'
              }`}
            >
              [{item.label}]
            </Link>
          ))}
          <Link
            href="/admin"
            className="whitespace-nowrap transition-colors uppercase text-text-primary hover:text-twitch-purple"
          >
            [ADMIN]
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-bg-secondary">
          <nav className="flex flex-col">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-text-primary border-b border-white/5 hover:bg-white/5"
            >
              [Se Connecter / S'inscrire]
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-6 py-4 text-sm font-semibold uppercase tracking-wider border-b border-white/5 hover:bg-white/5 ${
                  isActive(item.href) ? 'text-twitch-purple bg-white/5' : 'text-text-primary'
                }`}
              >
                [{item.label}]
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
