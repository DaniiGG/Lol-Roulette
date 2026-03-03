// components/Navbar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from "next/image";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: '/', label: 'Play', icon: '🎮' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/howtoplay', label: 'How to Play', icon: '📖' },
    { href: '/tips', label: 'Tips & Strategy', icon: '💡' },
    { href: '/faq', label: 'FAQ', icon: '❓' },
    { href: '/about', label: 'About', icon: 'ℹ️' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
                src="/images/logo.png"
                alt="League Roulette Logo"
                width={40}
                height={40}
                className="object-contain"
            />
            <div className="hidden sm:block">
              <div className="text-white font-bold text-lg">League Roulette</div>
              <div className="text-neutral-500 text-xs -mt-1">Random Champion Challenge</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive(link.href)
                    ? 'bg-[#C89B3C] text-neutral-950'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }
                `}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-800 bg-neutral-950/98 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${isActive(link.href)
                    ? 'bg-[#C89B3C] text-neutral-950'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }
                `}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            
            {/* Additional Mobile Links */}
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
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