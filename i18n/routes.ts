/**
 * Centralized, locale-aware route registry.
 *
 * Every public page has a stable internal pathname (used by the App Router)
 * and, optionally, a localized public pathname per locale. next-intl uses the
 * `pathnames` map below to rewrite public URLs to internal route files and to
 * generate links, redirects and canonical/hreflang URLs.
 *
 * Add a new language once in LOCALES, then add its translated segment to the
 * routes that are actually available in that language. Routes missing a locale
 * fall back to their internal (English) pathname and are listed as unavailable
 * for that locale in ROUTE_LOCALES, so they are never advertised in hreflang,
 * the sitemap or the language switcher.
 */

export const LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ja',
  'zh-CN',
  'ko',
  'ar',
  'ru',
  'nl',
  'pl',
] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

const ALL_LOCALES = LOCALES

/** Locales with real translations for the blog and champion guides. */
export const CONTENT_LOCALES = ['en', 'es'] as const

type LocalePaths = Record<Locale, string>

function paths(
  en: string,
  es: string,
  fr: string,
  de: string,
  it: string,
  pt: string,
  ja: string,
  zh: string,
  ko: string,
  ar: string,
  ru: string,
  nl: string,
  pl: string
): LocalePaths {
  return { en, es, fr, de, it, pt, ja, 'zh-CN': zh, ko, ar, ru, nl, pl }
}

function same(path: string): LocalePaths {
  return paths(path, path, path, path, path, path, path, path, path, path, path, path, path)
}

/**
 * Internal pathname => localized public pathname.
 * Keys are the stable route identifiers used by the app and by next-intl Link.
 */
export const pathnames = {
  '/': same('/'),

  '/about': same('/about'),

  '/challenges': same('/challenges'),

  '/contact': same('/contact'),

  '/faq': same('/faq'),

  '/find-your-main': same('/find-your-main'),

  '/howtoplay': same('/howtoplay'),

  '/leaderboard': same('/leaderboard'),

  '/mastery': same('/mastery'),

  '/mastery-tree': {
    en: '/mastery-tree',
    es: '/mastery-tree',
  },

  '/modes': same('/modes'),

  '/popular': same('/popular'),

  '/privacy': same('/privacy'),

  '/terms': same('/terms'),

  '/tierlist': same('/tierlist'),

  '/tips': same('/tips'),

  // Lanes
  '/top-lane': same('/top-lane'),
  '/mid-lane': same('/mid-lane'),
  '/adc': same('/adc'),
  '/support': same('/support'),
  '/aram': same('/aram'),

  // Blog (only published in English and Spanish)
  '/blog': same('/blog'),
  '/blog/champions': same('/blog/champions'),
  '/blog/guides': same('/blog/guides'),
  '/blog/tier-lists': same('/blog/tier-lists'),
  '/blog/beginners': same('/blog/beginners'),
  '/blog/ranked': same('/blog/ranked'),
  '/blog/mechanics': same('/blog/mechanics'),
  '/blog/league-roulette': same('/blog/league-roulette'),
  '/blog/guides/[champion]': {
    en: '/blog/guides/[champion]',
    es: '/blog/guides/[champion]',
  },
  '/blog/[slug]': {
    en: '/blog/[slug]',
    es: '/blog/[slug]',
  },
} as const

export type AppPathnames = keyof typeof pathnames

/** Stable route identifiers for code that should not depend on raw strings. */
export const ROUTES = {
  home: '/',
  about: '/about',
  challenges: '/challenges',
  contact: '/contact',
  faq: '/faq',
  findYourMain: '/find-your-main',
  howToPlay: '/howtoplay',
  leaderboard: '/leaderboard',
  mastery: '/mastery',
  masteryTree: '/mastery-tree',
  modes: '/modes',
  popular: '/popular',
  privacy: '/privacy',
  terms: '/terms',
  tierlist: '/tierlist',
  tips: '/tips',
  topLane: '/top-lane',
  midLane: '/mid-lane',
  adc: '/adc',
  support: '/support',
  aram: '/aram',
  blog: '/blog',
  blogChampions: '/blog/champions',
  blogGuides: '/blog/guides',
  blogTierLists: '/blog/tier-lists',
  blogBeginners: '/blog/beginners',
  blogRanked: '/blog/ranked',
  blogMechanics: '/blog/mechanics',
  blogLeagueRoulette: '/blog/league-roulette',
  blogGuide: '/blog/guides/[champion]',
  blogPost: '/blog/[slug]',
} as const satisfies Record<string, AppPathnames>

/**
 * Locales in which each route has real translated content.
 * Used for hreflang, the sitemap and the language switcher.
 */
export const ROUTE_LOCALES: Record<AppPathnames, readonly string[]> = {
  '/': ALL_LOCALES,
  '/about': ALL_LOCALES,
  '/challenges': ALL_LOCALES,
  '/contact': ALL_LOCALES,
  '/faq': ALL_LOCALES,
  '/find-your-main': ALL_LOCALES,
  '/howtoplay': ALL_LOCALES,
  '/leaderboard': ALL_LOCALES,
  '/mastery': ALL_LOCALES,
  '/mastery-tree': CONTENT_LOCALES,
  '/modes': ALL_LOCALES,
  '/popular': ALL_LOCALES,
  '/privacy': ALL_LOCALES,
  '/terms': ALL_LOCALES,
  '/tierlist': ALL_LOCALES,
  '/tips': ALL_LOCALES,
  '/top-lane': ALL_LOCALES,
  '/mid-lane': ALL_LOCALES,
  '/adc': ALL_LOCALES,
  '/support': ALL_LOCALES,
  '/aram': ALL_LOCALES,
  '/blog': CONTENT_LOCALES,
  '/blog/champions': CONTENT_LOCALES,
  '/blog/guides': CONTENT_LOCALES,
  '/blog/tier-lists': CONTENT_LOCALES,
  '/blog/beginners': CONTENT_LOCALES,
  '/blog/ranked': CONTENT_LOCALES,
  '/blog/mechanics': CONTENT_LOCALES,
  '/blog/league-roulette': CONTENT_LOCALES,
  '/blog/guides/[champion]': CONTENT_LOCALES,
  '/blog/[slug]': CONTENT_LOCALES,
}

export const BLOG_CATEGORY_ROUTES = {
  champions: '/blog/champions',
  guides: '/blog/guides',
  'tier-lists': '/blog/tier-lists',
  beginners: '/blog/beginners',
  ranked: '/blog/ranked',
  mechanics: '/blog/mechanics',
  'league-roulette': '/blog/league-roulette',
} as const satisfies Record<string, AppPathnames>

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}

export function isPathname(value: string): value is AppPathnames {
  return value in pathnames
}

export function getRouteLocales(pathname: AppPathnames): readonly string[] {
  return ROUTE_LOCALES[pathname] ?? ALL_LOCALES
}

export function isRouteAvailable(pathname: AppPathnames, locale: string): boolean {
  return getRouteLocales(pathname).includes(locale)
}

export function getLocalizedRouteTemplate(
  pathname: AppPathnames,
  locale: string
): string {
  const config = pathnames[pathname]
  if (typeof config === 'string') return config
  return (config as Record<string, string>)[locale] ?? pathname
}
