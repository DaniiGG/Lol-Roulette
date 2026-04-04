'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) =>
    path === '/blog' ? pathname.startsWith('/blog') : pathname === path

  const navLinks = [
    { href: '/', label: 'Play', icon: '🎮' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/howtoplay', label: 'How to Play', icon: '📖' },
    { href: '/tips', label: 'Tips & Strategy', icon: '💡' },
    { href: '/faq', label: 'FAQ', icon: '❓' },
    { href: '/about', label: 'About', icon: 'ℹ️' },
    { href: '/blog', label: 'Blog', icon: '📝' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="League Roulette Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-white">League Roulette</div>
              <div className="-mt-1 text-xs text-neutral-500">
                Random Champion Challenge
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  rounded-lg px-4 py-2 text-sm font-medium transition-all
                  ${
                    isActive(link.href)
                      ? 'bg-[#C89B3C] text-neutral-950'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }
                `}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-neutral-800 bg-neutral-950/98 backdrop-blur-sm lg:hidden">
          <div className="space-y-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block rounded-lg px-4 py-3 text-sm font-medium transition-all
                  ${
                    isActive(link.href)
                      ? 'bg-[#C89B3C] text-neutral-950'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }
                `}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="space-y-2 border-t border-neutral-800 pt-4">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-neutral-400 transition hover:text-white"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-neutral-400 transition hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-neutral-400 transition hover:text-white"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
