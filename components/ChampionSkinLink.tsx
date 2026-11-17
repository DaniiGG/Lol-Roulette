'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Palette, ArrowUpRight } from 'lucide-react'

export default function ChampionSkinLink({ championId }: { championId: string }) {
  const locale = useLocale()
  const prefix = locale === 'es' ? '/es' : ''
  return <Link href={`${prefix}/skins/${championId.toLowerCase()}`} className="mx-auto flex w-fit items-center gap-2 rounded-lg border border-[#C89B3C]/20 bg-[#C89B3C]/5 px-4 py-2 text-xs text-[#d8bd88] transition hover:border-[#C89B3C]/60 hover:bg-[#C89B3C]/10"><Palette size={14} aria-hidden="true" />{locale === 'es' ? 'Ver sus skins' : 'Explore skins'}<ArrowUpRight size={12} aria-hidden="true" /></Link>
}
