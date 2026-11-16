'use client'

import { useLocale } from 'next-intl'
import Link from 'next/link'
import { GUIDE_CHAMPIONS, getGuideHref, isGuideLocale } from '@/lib/guides/meta'

export default function ChampionGuideLink({ championId }: { championId: string }) {
  const locale = useLocale()
  const guide = GUIDE_CHAMPIONS.find(entry => entry.championId === championId)
  if (!guide || !isGuideLocale(locale)) return null
  const name = championId === 'KSante' ? "K'Sante" : championId
  return <Link className="inline-block rounded-xl border border-[#C89B3C]/40 px-4 py-3 text-[#C89B3C] hover:bg-[#C89B3C]/10" href={getGuideHref(guide.slug, locale)}>
    {locale === 'es' ? `Cómo jugar ${name}` : `How to play ${name}`}
  </Link>
}
