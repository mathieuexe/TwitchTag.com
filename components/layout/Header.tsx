'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Twitch, Menu, X, Crown, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Générateur' },
    { href: '/verifier', label: 'Vérificateur' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-secondary border-b-4 border-[#303032] shadow-brutal-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-12 h-12 bg-twitch-purple text-white border-2 border-white/20 shadow-brutal-white group-hover:-translate-y-1 group-hover:shadow-brutal-yellow transition-all duration-200">
              <Twitch className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white uppercase hidden sm:block">
              Twitch<span className="text-twitch-purple">Tag</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 ${
                  isActive(item.href)
                    ? 'bg-white text-black border-white shadow-brutal'
                    : 'bg-transparent text-text-primary border-transparent hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Donate Button - Desktop */}
            <Link
              href="/donation"
              className="hidden sm:flex items-center gap-2 px-5 py-2 bg-twitch-yellow text-black text-sm font-bold uppercase tracking-wider border-2 border-black shadow-brutal transition-all hover:-translate-y-1 hover:shadow-brutal-lg active:translate-y-0 active:shadow-none"
            >
              <Crown className="w-5 h-5" />
              <span>Soutenir</span>
            </Link>

            {/* Admin Link */}
            <Link
              href="/admin"
              className="flex items-center justify-center w-12 h-12 bg-bg-tertiary border-2 border-[#303032] text-white hover:border-twitch-cyan hover:text-twitch-cyan hover:-translate-y-1 hover:shadow-brutal-cyan transition-all duration-200"
              title="Admin"
            >
              <ShieldAlert className="w-6 h-6" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-12 h-12 bg-bg-tertiary border-2 border-[#303032] text-white hover:border-white transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-4 border-[#303032] py-6 bg-bg-secondary">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-5 py-4 text-base font-bold uppercase tracking-wider border-2 transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-white text-black border-white shadow-brutal'
                      : 'bg-transparent text-white border-[#303032] hover:border-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/donation"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-5 py-4 mt-4 bg-twitch-yellow text-black text-base font-bold uppercase tracking-wider border-2 border-black shadow-brutal"
              >
                <Crown className="w-5 h-5" />
                <span>Soutenir le projet</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
