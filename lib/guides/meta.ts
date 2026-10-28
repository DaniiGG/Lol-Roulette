import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routes'
import type { GuideChampionMeta, GuideRole } from './types'

export const GUIDE_PATCH = '26.21'
export const GUIDE_DDRAGON_VERSION = '16.21.1'
export const GUIDE_UPDATED_AT = '2026-10-27'
export const GUIDE_INDEX_PATH = '/blog/guides'
export const GUIDE_LOCALES = ['en', 'es'] as const

export type GuideLocale = (typeof GUIDE_LOCALES)[number]

const DD_SPLASH = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash'
const DD_LOADING = 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading'
const DD_CDN = 'https://ddragon.leagueoflegends.com/cdn'

function splashFor(championId: string) {
  return `${DD_SPLASH}/${championId}_0.jpg`
}

function loadingFor(championId: string) {
  return `${DD_LOADING}/${championId}_0.jpg`
}

const UGGBASE = 'https://u.gg/lol/champions'
const LOLALYTICS_BASE = 'https://lolalytics.com/lol'

export const GUIDE_CHAMPIONS: GuideChampionMeta[] = [
  {
    slug: 'katarina',
    championId: 'Katarina',
    roles: ['mid', 'top'],
    primaryRole: 'mid',
    ddragonDifficulty: 8,
    localizedSlugs: {
      en: 'how-to-play-katarina',
      es: 'como-jugar-katarina',
    },
    publishedAt: '2026-10-27',
    updatedAt: GUIDE_UPDATED_AT,
    related: ['sett', 'ksante'],
    splash: splashFor('Katarina'),
    loading: loadingFor('Katarina'),
    stats: [
      {
        source: 'U.GG',
        context: 'Mid · Emerald+ · Global · Patch 26.21',
        winRate: '50.87%',
        pickRate: '6.6%',
        banRate: '12%',
        matches: '74,023',
        tier: 'S+',
        rank: '21 / 59',
        url: `${UGGBASE}/katarina/build?role=mid&region=world`,
      },
      {
        source: 'Lolalytics',
        context: 'Mid · Emerald+ · Global · Patch 26.21',
        winRate: '52.42%',
        pickRate: '6.53%',
        banRate: '11.68%',
        matches: '80,861',
        tier: 'S+',
        rank: '2 / 96',
        url: `${LOLALYTICS_BASE}/katarina/build/?lane=middle&tier=emerald_plus`,
      },
    ],
    sources: [
      {
        label: 'U.GG — Katarina build, runes and skill order',
        url: `${UGGBASE}/katarina/build?role=mid&region=world`,
      },
      {
        label: 'Lolalytics — Katarina mid build and counters',
        url: `${LOLALYTICS_BASE}/katarina/build/?lane=middle&tier=emerald_plus`,
      },
      {
        label: 'Riot Data Dragon 16.21.1 — champion, item and rune data',
        url: 'https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/champion.json',
      },
    ],
  },
  {
    slug: 'sett',
    championId: 'Sett',
    roles: ['top'],
    primaryRole: 'top',
    ddragonDifficulty: 2,
    localizedSlugs: {
      en: 'how-to-play-sett',
      es: 'como-jugar-sett',
    },
    publishedAt: '2026-10-27',
    updatedAt: GUIDE_UPDATED_AT,
    related: ['ksante', 'katarina'],
    splash: splashFor('Sett'),
    loading: loadingFor('Sett'),
    stats: [
      {
        source: 'U.GG',
        context: 'Top · Emerald+ · Global · Patch 26.21',
        winRate: '50.42%',
        pickRate: '6.2%',
        banRate: '2.7%',
        matches: '70,015',
        tier: 'S',
        rank: '29 / 63',
        url: `${UGGBASE}/sett/build?role=top&region=world`,
      },
      {
        source: 'Lolalytics',
        context: 'Top · Emerald+ · Global · Patch 26.21',
        winRate: '52.47%',
        pickRate: '6.34%',
        banRate: '2.85%',
        matches: '77,814',
        tier: 'A-',
        rank: '30 / 111',
        url: `${LOLALYTICS_BASE}/sett/build/?lane=top&tier=emerald_plus`,
      },
    ],
    sources: [
      {
        label: 'U.GG — Sett build, runes and skill order',
        url: `${UGGBASE}/sett/build?role=top&region=world`,
      },
      {
        label: 'Lolalytics — Sett top build and counters',
        url: `${LOLALYTICS_BASE}/sett/build/?lane=top&tier=emerald_plus`,
      },
      {
        label: 'Riot Data Dragon 16.21.1 — champion, item and rune data',
        url: 'https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/champion.json',
      },
    ],
  },
  {
    slug: 'ksante',
    championId: 'KSante',
    roles: ['top'],
    primaryRole: 'top',
    ddragonDifficulty: 9,
    localizedSlugs: {
      en: 'how-to-play-ksante',
      es: 'como-jugar-ksante',
    },
    publishedAt: '2026-10-27',
    updatedAt: GUIDE_UPDATED_AT,
    related: ['sett', 'katarina'],
    splash: splashFor('KSante'),
    loading: loadingFor('KSante'),
    stats: [
      {
        source: 'U.GG',
        context: 'Top · Emerald+ · Global · Patch 26.21',
        winRate: '46.66%',
        pickRate: '3.6%',
        banRate: '2.5%',
        matches: '40,882',
        tier: 'D',
        rank: '63 / 63',
        url: `${UGGBASE}/ksante/build?role=top&region=world`,
      },
      {
        source: 'Lolalytics',
        context: 'Top · Emerald+ · Global · Patch 26.21',
        winRate: '47.83%',
        pickRate: '3.59%',
        banRate: '2.42%',
        matches: '44,026',
        tier: 'C-',
        rank: '93 / 111',
        url: `${LOLALYTICS_BASE}/ksante/build/?lane=top&tier=emerald_plus`,
      },
    ],
    sources: [
      {
        label: 'U.GG — K\'Sante build, runes and skill order',
        url: `${UGGBASE}/ksante/build?role=top&region=world`,
      },
      {
        label: 'Lolalytics — K\'Sante top build and counters',
        url: `${LOLALYTICS_BASE}/ksante/build/?lane=top&tier=emerald_plus`,
      },
      {
        label: 'Riot Data Dragon 16.21.1 — champion, item and rune data',
        url: 'https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/champion.json',
      },
    ],
  },
  {
    slug: 'azir',
    championId: 'Azir',
    roles: ['mid'],
    primaryRole: 'mid',
    ddragonDifficulty: 9,
    localizedSlugs: {
      en: 'how-to-play-azir',
      es: 'como-jugar-azir',
    },
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
    related: ['katarina', 'sett'],
    splash: splashFor('Azir'),
    loading: loadingFor('Azir'),
    stats: [
      {
        source: 'Lolalytics',
        context: 'Mid · Emerald+ · Global · Patch 16.21',
        winRate: '48.71%',
        pickRate: '2.02%',
        banRate: '0.33%',
        matches: '30,885',
        tier: 'D+',
        rank: '85 / 95',
        url: `${LOLALYTICS_BASE}/azir/build/?lane=middle&tier=emerald_plus`,
      },
    ],
    sources: [],
  },
  {
    slug: 'riven',
    championId: 'Riven',
    roles: ['top'],
    primaryRole: 'top',
    ddragonDifficulty: 8,
    localizedSlugs: {
      en: 'how-to-play-riven',
      es: 'como-jugar-riven',
    },
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
    related: ['sett', 'ksante'],
    splash: splashFor('Riven'),
    loading: loadingFor('Riven'),
    stats: [
      {
        source: 'Lolalytics',
        context: 'Top · Emerald+ · Global · Patch 16.21',
        winRate: '51.64%',
        pickRate: '2.27%',
        banRate: '1.4%',
        matches: '34,405',
        tier: 'A+',
        rank: '16 / 111',
        url: `${LOLALYTICS_BASE}/riven/build/?lane=top&tier=emerald_plus`,
      },
    ],
    sources: [],
  },
  {
    slug: 'gangplank',
    championId: 'Gangplank',
    roles: ['top'],
    primaryRole: 'top',
    ddragonDifficulty: 7,
    localizedSlugs: {
      en: 'how-to-play-gangplank',
      es: 'como-jugar-gangplank',
    },
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
    related: ['sett', 'ksante'],
    splash: splashFor('Gangplank'),
    loading: loadingFor('Gangplank'),
    stats: [
      {
        source: 'Lolalytics',
        context: 'Top · Emerald+ · Global · Patch 16.21',
        winRate: '52.54%',
        pickRate: '5.14%',
        banRate: '8.84%',
        matches: '78,032',
        tier: 'A',
        rank: '19 / 111',
        url: `${LOLALYTICS_BASE}/gangplank/build/?lane=top&tier=emerald_plus`,
      },
    ],
    sources: [],
  },
]

export const GUIDE_SLUGS = GUIDE_CHAMPIONS.map((guide) => guide.slug)

export const GUIDE_ROLES: GuideRole[] = ['top', 'jungle', 'mid', 'adc', 'support']

export function isGuideLocale(locale: string): locale is GuideLocale {
  return (GUIDE_LOCALES as readonly string[]).includes(locale)
}

export function getGuideMeta(slug: string): GuideChampionMeta | undefined {
  return GUIDE_CHAMPIONS.find((guide) => guide.slug === slug)
}

export function getGuideSlug(slug: string, locale: string): string {
  const guide = getGuideMeta(slug)
  if (!guide) return slug
  return isGuideLocale(locale) ? guide.localizedSlugs[locale] : guide.localizedSlugs.en
}

export function getGuidePath(slug: string, locale: string): string {
  return `${GUIDE_INDEX_PATH}/${getGuideSlug(slug, locale)}`
}

export function getGuideHref(slug: string, locale: string): string {
  return getPathname({
    locale: locale as Locale,
    href: {
      pathname: '/blog/guides/[champion]',
      params: { champion: getGuideSlug(slug, locale) },
    },
  })
}

export function getGuideIndexHref(locale: string): string {
  return getPathname({
    locale: locale as Locale,
    href: { pathname: '/blog/guides' },
  })
}

export function resolveGuideSlug(slug: string): string | undefined {
  if (getGuideMeta(slug)) return slug
  return GUIDE_CHAMPIONS.find(
    (guide) => guide.localizedSlugs.en === slug || guide.localizedSlugs.es === slug
  )?.slug
}

export function getRelatedGuides(slug: string): GuideChampionMeta[] {
  const guide = getGuideMeta(slug)
  if (!guide) return []
  return guide.related.map((related) => getGuideMeta(related)).filter(Boolean) as GuideChampionMeta[]
}

export function translateGuidePath(pathname: string, targetLocale: string): string {
  const match = pathname.match(/^\/blog\/guides\/([^/]+)\/?$/)
  if (!match) return pathname

  const canonical = resolveGuideSlug(match[1])
  if (!canonical) return pathname
  if (!isGuideLocale(targetLocale)) return getGuideIndexHref(targetLocale)

  return getGuideHref(canonical, targetLocale)
}

export function guideSplashUrl(championId: string): string {
  return splashFor(championId)
}

export function guideLoadingUrl(championId: string): string {
  return loadingFor(championId)
}

export function guideChampionIconUrl(icon: string): string {
  return `${DD_CDN}/${GUIDE_DDRAGON_VERSION}/img/champion/${icon}`
}

export function guideAbilityIconUrl(key: string, icon: string): string {
  const folder = key === 'P' ? 'passive' : 'spell'
  return `${DD_CDN}/${GUIDE_DDRAGON_VERSION}/img/${folder}/${icon}`
}

export function guideItemIconUrl(icon: string): string {
  return `${DD_CDN}/${GUIDE_DDRAGON_VERSION}/img/item/${icon}`
}

export function guideRuneIconUrl(icon: string): string {
  return `${DD_CDN}/img/${icon}`
}

export function guideSummonerIconUrl(icon: string): string {
  return `${DD_CDN}/${GUIDE_DDRAGON_VERSION}/img/spell/${icon}`
}
