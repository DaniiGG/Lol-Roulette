"use client"

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { isRouteAvailable, type AppPathnames } from '@/i18n/routes'
import LocaleSwitcher from './LocaleSwitcher'

type NavLink = {
  href: Exclude<AppPathnames, '/blog/[slug]' | '/blog/guides/[champion]'>
  label: string
  badge?: string
}

type NavGroup = {
  id: 'tools' | 'learn'
  label: string
  links: NavLink[]
}

const linkClass = 'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400'
const activeClass = 'bg-cyan-500/10 text-cyan-300'
const inactiveClass = 'text-zinc-300 hover:bg-zinc-800 hover:text-white'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<NavGroup['id'] | null>(null)
  const mobileToggle = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')
  const tQuiz = useTranslations('quiz')
  const tBlog = useTranslations('blog')

  const onGuides = pathname === '/blog/guides' || pathname.startsWith('/blog/guides/')
  const isActive = (href: NavLink['href']) => {
    if (href === '/blog/guides') return onGuides
    if (href === '/blog') return !onGuides && (pathname === '/blog' || pathname.startsWith('/blog/'))
    return pathname === href
  }

  const play: NavLink = { href: '/', label: t('play') }
  const challenges: NavLink = { href: '/challenges', label: t('challenges') }
  const groups: NavGroup[] = [
    {
      id: 'tools',
      label: t('tools'),
      links: [
        { href: '/find-your-main', label: tQuiz('navLabel') },
        ...(isRouteAvailable('/random-team-generator', locale)
          ? [{ href: '/random-team-generator' as const, label: locale === 'es' ? 'Generador de equipos LoL' : 'LoL Team Generator' }]
          : []),
        ...(isRouteAvailable('/bot-lane-duo-randomizer', locale)
          ? [{ href: '/bot-lane-duo-randomizer' as const, label: t('duoRoulette'), badge: t('duoNew') }]
          : []),
        { href: '/mastery', label: t('mastery') },
        ...(isRouteAvailable('/mastery-tree', locale)
          ? [{ href: '/mastery-tree' as const, label: t('masteryTree') }]
          : []),
        { href: '/leaderboard', label: t('leaderboard') },
      ],
    },
    {
      id: 'learn',
      label: t('learn'),
      links: [
        { href: '/howtoplay', label: t('howToPlay') },
        { href: '/blog/guides', label: tBlog('categories.guides.name') },
        { href: '/blog', label: t('blog') },
      ],
    },
  ]
  const secondaryLinks: NavLink[] = [
    { href: '/contact', label: t('contact') },
    { href: '/privacy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
  ]

  function closeMenus() {
    setMobileOpen(false)
    setOpenGroup(null)
  }

  function renderLink(link: NavLink, { block = false, primary = false } = {}) {
    const active = isActive(link.href)
    const color = primary ? 'bg-cyan-300 font-semibold text-zinc-950 hover:bg-cyan-200' : active ? activeClass : inactiveClass

    return (
      <Link
        key={link.href}
        href={link.href}
        prefetch={false}
        aria-current={active ? 'page' : undefined}
        onClick={closeMenus}
        className={`${linkClass} ${color} ${block ? 'block' : 'inline-flex whitespace-nowrap'}`}
      >
        {link.label}
        {link.badge && <span className="ms-2 inline-block rounded-md bg-amber-300/15 px-2 py-0.5 text-xs font-semibold text-amber-200">{link.badge}</span>}
      </Link>
    )
  }

  return (
    <nav
      aria-label={t('navigation')}
      className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && mobileOpen && !event.defaultPrevented) {
          setMobileOpen(false)
          mobileToggle.current?.focus()
        }
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" prefetch={false} onClick={closeMenus} className="group flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400">
          <Image src="/images/logo.png" alt={t('siteName')} width={36} height={36} className="object-contain" />
          <span aria-hidden="true" className="hidden text-lg font-bold tracking-tight text-white sm:block" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
            {t('siteName')}
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {renderLink(play, { primary: true })}
          {renderLink(challenges)}
          {groups.map((group) => {
            const expanded = openGroup === group.id
            return (
              <div
                key={group.id}
                className="relative"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setOpenGroup(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && expanded) {
                    event.preventDefault()
                    setOpenGroup(null)
                    event.currentTarget.querySelector('button')?.focus()
                  }
                }}
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`nav-${group.id}`}
                  onClick={() => setOpenGroup(expanded ? null : group.id)}
                  className={`${linkClass} inline-flex items-center gap-1.5 whitespace-nowrap ${expanded || group.links.some((link) => isActive(link.href)) ? activeClass : inactiveClass}`}
                >
                  {group.label}
                  <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                <div id={`nav-${group.id}`} hidden={!expanded} className="absolute start-0 top-full mt-2 w-max min-w-48 max-w-72 space-y-1 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-xl">
                  {expanded && group.links.map((link) => renderLink(link, { block: true }))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="hidden lg:block">
          <LocaleSwitcher />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          {renderLink(play, { primary: true })}
          <button
            ref={mobileToggle}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`${linkClass} ${mobileOpen ? activeClass : inactiveClass} p-2`}
            aria-label={t('navigation')}
            aria-expanded={mobileOpen}
            aria-controls="nav-mobile"
          >
            {mobileOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          </button>
        </div>
      </div>

      <div id="nav-mobile" hidden={!mobileOpen} className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-zinc-800 bg-zinc-950 px-4 py-3 lg:hidden">
        {mobileOpen && (
          <div className="mx-auto max-w-xl">
            {renderLink(challenges, { block: true })}
            {groups.map((group) => (
              <section key={group.id} aria-labelledby={`mobile-${group.id}`} className="mt-2 space-y-1 border-t border-zinc-800 pt-3">
                <h2 id={`mobile-${group.id}`} className="px-3 text-xs font-semibold text-zinc-400">{group.label}</h2>
                {group.links.map((link) => renderLink(link, { block: true }))}
              </section>
            ))}
            <div className="mt-3 border-t border-zinc-800 pt-3">
              <div className="px-3"><LocaleSwitcher /></div>
              <div className="mt-2 flex flex-wrap gap-1">
                {secondaryLinks.map((link) => renderLink(link))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
