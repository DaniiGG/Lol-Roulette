"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import LocaleSwitcher from './LocaleSwitcher'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('nav')

  const isActive = (path: string) => path === '/blog' ? pathname.startsWith('/blog') : pathname === path

  const navLinks = [
    { href: '/', label: t('play'), icon: '🎮' },
    { href: '/leaderboard', label: t('leaderboard'), icon: '🏆' },
    { href: '/mastery', label: t('mastery'), icon: '🏅' },
    { href: '/howtoplay', label: t('howToPlay'), icon: '📖' },
    { href: '/tips', label: t('tips'), icon: '💡' },
    { href: '/faq', label: t('faq'), icon: '❓' },
    { href: '/blog', label: t('blog'), icon: '📝' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/images/logo.png"
                alt="League Roulette"
                width={36}
                height={36}
                className="object-contain relative"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-white tracking-tight"
                   style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {t('siteName')}
              </div>
              <div className="-mt-1 text-[10px] text-zinc-500 tracking-widest uppercase">
                {t('siteTagline')}
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                  ${isActive(link.href)
                    ? 'text-cyan-300'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }
                `}
              >
                {isActive(link.href) && (
                  <span className="absolute inset-0 rounded-lg border border-cyan-400/30 bg-cyan-500/5" />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>{link.icon}</span>
                  <span className="tracking-wide">{link.label}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <LocaleSwitcher />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white lg:hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-zinc-800/60 bg-zinc-950/98 backdrop-blur-xl lg:hidden animate-slide-down">
          <div className="space-y-1 px-4 py-4">
            <div className="px-2 py-2">
              <LocaleSwitcher />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block rounded-lg px-4 py-3 text-sm font-medium transition-all
                  ${isActive(link.href)
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }
                `}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div className="space-y-1 border-t border-zinc-800/60 pt-3 mt-3">
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-zinc-500 hover:text-white transition">{t('contact')}</Link>
              <Link href="/privacy" onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-zinc-500 hover:text-white transition">{t('privacy')}</Link>
              <Link href="/terms" onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-zinc-500 hover:text-white transition">{t('terms')}</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}