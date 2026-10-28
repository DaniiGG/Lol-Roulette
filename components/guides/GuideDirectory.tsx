'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, Clock, Search, Shield, Sparkles, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { GuideRole } from '@/lib/guides/types'

export type GuideDirectoryItem = {
  slug: string
  name: string
  title: string
  role: GuideRole
  roleLabel: string
  roles: GuideRole[]
  tagline: string
  difficultyLabel: string
  splash: string
  href: string
  updatedLabel: string
  patchLabel: string
  readingTime: number
  winRate: string
  availableLocales: string[]
}

type GuideDirectoryProps = {
  items: GuideDirectoryItem[]
}

const ROLE_FILTERS: Array<GuideRole | 'all'> = ['all', 'top', 'mid', 'jungle', 'adc', 'support']

export default function GuideDirectory({ items }: GuideDirectoryProps) {
  const t = useTranslations('guide-ui')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<GuideRole | 'all'>('all')

  const availableRoles = useMemo(
    () => ROLE_FILTERS.filter((candidate) => candidate === 'all' || items.some((item) => item.roles.includes(candidate))),
    [items]
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesRole = role === 'all' || item.roles.includes(role)
      if (!matchesRole) return false
      if (!normalized) return true
      const haystack = [
        item.name,
        item.title,
        item.tagline,
        item.roleLabel,
        item.difficultyLabel,
        ...item.roles.map((itemRole) => t(`roles.${itemRole}`)),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })
  }, [items, query, role, t])

  const hasFilters = query.trim().length > 0 || role !== 'all'

  return (
    <section aria-labelledby="guide-directory-heading">
      <h2 id="guide-directory-heading" className="sr-only">
        {t('directory.eyebrow')}
      </h2>

      <div className="mb-8 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-2xl shadow-neutral-950/30 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="group relative block flex-1">
            <span className="sr-only">{t('directory.searchLabel')}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500 transition group-focus-within:text-[#C89B3C]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('directory.searchPlaceholder')}
              className="h-12 w-full rounded-2xl border border-neutral-700 bg-neutral-950/80 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-[#C89B3C]/70 focus:ring-2 focus:ring-[#C89B3C]/20"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('directory.filterLabel')}>
            {availableRoles.map((candidate) => {
              const active = role === candidate
              return (
                <button
                  key={candidate}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRole(candidate)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? 'border-[#C89B3C] bg-[#C89B3C] text-neutral-950'
                      : 'border-neutral-700 bg-neutral-950/60 text-neutral-300 hover:border-neutral-500 hover:text-white'
                  }`}
                >
                  {candidate === 'all' ? t('directory.allRoles') : t(`roles.${candidate}`)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-4">
          <p className="text-sm text-neutral-400" aria-live="polite">
            {t('directory.results', { count: filtered.length })}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setRole('all')
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              {t('directory.clear')}
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.slug}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/80 transition duration-300 hover:-translate-y-1 hover:border-[#C89B3C]/40 hover:shadow-2xl hover:shadow-[#C89B3C]/5"
            >
              <Link href={item.href} className="relative block aspect-[16/10] overflow-hidden">
                <Image
                  src={item.splash}
                  alt={`${item.name} splash art`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover object-center transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/15 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#C89B3C]/30 bg-neutral-950/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#C89B3C] backdrop-blur">
                    {item.roleLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-neutral-950/70 px-2.5 py-1 text-[11px] font-medium text-neutral-200 backdrop-blur">
                    {item.difficultyLabel}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-300/80">{item.title}</p>
                  <h3 className="mt-1 text-3xl font-semibold tracking-tight text-white">{item.name}</h3>
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <p className="line-clamp-3 text-sm leading-6 text-neutral-300">{item.tagline}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950/70 px-2.5 py-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#C89B3C]" />
                    {item.patchLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950/70 px-2.5 py-1">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    {item.winRate} WR
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950/70 px-2.5 py-1">
                    <Clock className="h-3.5 w-3.5 text-cyan-300" />
                    {t('guide.readTime', { n: item.readingTime })}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-800/80 pt-4">
                  <span className="text-[11px] text-neutral-500">{item.updatedLabel}</span>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C89B3C] transition hover:text-[#e8c77e]"
                  >
                    {t('directory.readGuide')}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/40 px-6 py-16 text-center">
          <p className="text-lg font-medium text-white">{t('directory.noResults')}</p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setRole('all')
            }}
            className="mt-4 rounded-full bg-[#C89B3C] px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
          >
            {t('directory.clear')}
          </button>
        </div>
      )}
    </section>
  )
}
