'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { ArrowUpRight, Crosshair, Plus, Sparkles, Trash2 } from 'lucide-react'
import AccessibleModal from './AccessibleModal'
import type {
  ChampionCatalogEntry,
  MasteryValue,
} from '@/lib/mastery-tree/explorer-types'
import { ROLE_COLORS, clamp, getLevelStyle } from '@/lib/mastery-tree/visuals'
import { championIconUrl, championSplashUrl } from '@/lib/champion-data'
import { GUIDE_CHAMPIONS, getGuideSlug } from '@/lib/guides/meta'

interface ChampionDetailsModalProps {
  open: boolean
  onClose: () => void
  champion: ChampionCatalogEntry | null
  mastery: MasteryValue | undefined
  locale: string
  rank: number | null
  total: number
  totalPoints: number
  onFocus: (champion: ChampionCatalogEntry) => void
  onPersonalize: (champion: ChampionCatalogEntry) => void
  onRemove: (champion: ChampionCatalogEntry) => void
}

export default function ChampionDetailsModal({
  open,
  onClose,
  champion,
  mastery,
  locale,
  rank,
  total,
  totalPoints,
  onFocus,
  onPersonalize,
  onRemove,
}: ChampionDetailsModalProps) {
  const t = useTranslations('masteryTreeExplorer')
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  if (!champion) return null

  const role = ROLE_COLORS[champion.primaryRole]
  const levelStyle = getLevelStyle(mastery?.level ?? null)
  const guide = GUIDE_CHAMPIONS.find((item) => item.championId === champion.key)
  const share =
    mastery?.points !== null &&
    mastery?.points !== undefined &&
    totalPoints > 0
      ? (mastery.points / totalPoints) * 100
      : 0
  const secondaryRoles = champion.roles.filter((item) => item !== champion.primaryRole)

  return (
    <AccessibleModal
      open={open}
      onClose={onClose}
      titleId="mt-details-title"
      closeLabel={t('detailsClose')}
      className="sm:max-w-xl"
    >
      <div className="relative h-44 overflow-hidden bg-[#0a0616]">
        <Image
          src={championSplashUrl(champion.key)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 576px"
          className="object-cover object-[center_24%] opacity-55"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090614] via-[#090614]/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#090614] to-transparent" />
      </div>

      <div className="relative px-5 pb-6 sm:px-7">
        <div className="-mt-14 flex items-end gap-4">
          <div
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-[3px] bg-[#090512] shadow-2xl"
            style={{ borderColor: role.color }}
          >
            <Image
              src={championIconUrl(champion.key)}
              alt={champion.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f0c75e]/80">
              {t('detailsTitle')}
            </p>
            <h2
              id="mt-details-title"
              className="truncate text-3xl leading-none text-white"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
            >
              {champion.name}
            </h2>
            <p className="mt-1 truncate text-sm text-white/45">{champion.title}</p>
            {rank !== null && (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f0c75e]/70">
                {t('detailsRank', { rank, total })}
              </p>
            )}
          </div>
          <div
            className="mb-2 shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              borderColor: `${role.color}55`,
              color: role.color,
              backgroundColor: role.soft,
            }}
          >
            {t(`roles.${champion.primaryRole}`)}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {t('detailsLevel')}
            </p>
            <p className="mt-1 text-xl font-bold" style={{ color: levelStyle.color }}>
              {mastery?.level !== null && mastery?.level !== undefined
                ? `M${mastery.level}`
                : t('detailsUnknown')}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {t('detailsPoints')}
            </p>
            <p className="mt-1 truncate text-xl font-bold text-white">
              {mastery?.points !== null && mastery?.points !== undefined
                ? numberFormatter.format(mastery.points)
                : t('detailsUnknown')}
            </p>
          </div>
          <div className="col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 sm:col-span-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {t('detailsRole')}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/85">
              {t(`roles.${champion.primaryRole}`)}
            </p>
          </div>
        </div>

        {secondaryRoles.length > 0 && (
          <div className="mt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {t('detailsSecondaryRoles')}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {secondaryRoles.map((secondary) => (
                <span
                  key={secondary}
                  className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    borderColor: `${ROLE_COLORS[secondary].color}44`,
                    color: ROLE_COLORS[secondary].color,
                    backgroundColor: ROLE_COLORS[secondary].soft,
                  }}
                >
                  {t(`roles.${secondary}`)}
                </span>
              ))}
            </div>
          </div>
        )}

        {mastery?.points !== null && mastery?.points !== undefined ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] text-white/40">
              <span>{t('detailsShare')}</span>
              <span>{numberFormatter.format(mastery.points)} pts</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${clamp(share, 3, 100)}%`,
                  background: `linear-gradient(90deg, ${role.color}, #f0c75e)`,
                }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-xs leading-relaxed text-white/40">
            {t('detailsNoMastery')}
          </p>
        )}

        {guide ? (
          <Link
            href={{
              pathname: '/blog/guides/[champion]',
              params: { champion: getGuideSlug(guide.slug, locale) },
            }}
            className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[#c89b3c]/25 bg-[#c89b3c]/[0.07] px-4 py-3 text-sm font-semibold text-[#f0c75e] transition hover:border-[#c89b3c]/50 hover:bg-[#c89b3c]/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {t('detailsGuide')}
            </span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/blog/guides"
            className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white/55 transition hover:border-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
          >
            <span>{t('detailsNoGuide')}</span>
            <span className="inline-flex items-center gap-1 text-[#f0c75e]">
              {t('detailsBrowseGuides')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onFocus(champion)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-[#f0c75e]/40 hover:bg-[#f0c75e]/10 hover:text-[#f0c75e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
          >
            <Crosshair className="h-4 w-4" />
            {t('detailsFocus')}
          </button>
          <button
            type="button"
            onClick={() => onPersonalize(champion)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#c89b3c]/35 bg-[#c89b3c]/10 px-4 py-2.5 text-xs font-semibold text-[#f0c75e] transition hover:bg-[#c89b3c]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
          >
            <Plus className="h-4 w-4" />
            {mastery ? t('detailsEdit') : t('detailsAdd')}
          </button>
          {mastery && (
            <button
              type="button"
              onClick={() => onRemove(champion)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-3.5 py-2.5 text-xs font-semibold text-red-300/75 transition hover:bg-red-400/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
              aria-label={t('detailsRemove')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </AccessibleModal>
  )
}
