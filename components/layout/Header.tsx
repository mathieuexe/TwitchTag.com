'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Twitch, Menu, X, MessageSquare, LogIn, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('Header')

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/verifier', label: t('verifier') },
    { href: '/donation', label: t('donation') },
    { href: '/chat', label: t('chat') },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col shadow-md">
      {/* Top Purple Bar */}
      <div className="bg-twitch-purple text-white px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center relative">
            <Twitch className="w-8 h-8 text-white z-10" />
            <div className="absolute -inset-1 bg-black/20 rounded-full blur-sm -z-0"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight uppercase leading-none">
              TwitchTag.com
            </span>
          </div>
        </Link>
        
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
      <div className="bg-bg-secondary border-b border-white/10 px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between overflow-x-auto hide-scrollbar">
        <nav className="flex items-center gap-6 text-sm font-semibold tracking-wide h-full">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap transition-colors uppercase flex items-center gap-1.5 h-full ${
                isActive(item.href)
                  ? 'text-twitch-purple border-b-2 border-twitch-purple'
                  : 'text-text-primary hover:text-twitch-purple border-b-2 border-transparent'
              }`}
            >
              {item.href === '/chat' && <MessageSquare className="w-4 h-4" />}
              [{item.label}]
            </Link>
          ))}
        </nav>

        {/* Auth Link (Desktop) */}
        <div className="hidden md:flex items-center">
          {session ? (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm font-bold text-twitch-purple hover:text-white transition-colors bg-twitch-purple/10 px-3 py-1.5 rounded-md"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('admin')}
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t('login')}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-bg-secondary">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-6 py-4 text-sm font-semibold uppercase tracking-wider border-b border-white/5 hover:bg-white/5 flex items-center gap-2 ${
                  isActive(item.href) ? 'text-twitch-purple bg-white/5' : 'text-text-primary'
                }`}
              >
                {item.href === '/chat' && <MessageSquare className="w-4 h-4" />}
                [{item.label}]
              </Link>
            ))}
            
            {/* Auth Link (Mobile) */}
            {session ? (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-4 text-sm font-bold uppercase tracking-wider border-b border-white/5 hover:bg-white/5 flex items-center gap-2 text-twitch-purple"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('admin_mobile')}
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-4 text-sm font-semibold uppercase tracking-wider border-b border-white/5 hover:bg-white/5 flex items-center gap-2 text-text-muted"
              >
                <LogIn className="w-4 h-4" />
                {t('login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
