import type { Metadata } from 'next'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import type { AppPathnames, Locale } from '@/i18n/routes'
import { SITE_URL } from '@/lib/site'

const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  pt: 'pt_PT',
  ja: 'ja_JP',
  'zh-CN': 'zh_CN',
  ko: 'ko_KR',
  ar: 'ar_SA',
  ru: 'ru_RU',
  nl: 'nl_NL',
  pl: 'pl_PL',
}

type RouteParams = Record<string, string>

type PageMetadataOptions = {
  locale: string
  path: AppPathnames
  params?: RouteParams
  title: string
  description: string
  keywords?: string[]
  type?: 'website' | 'article'
  robots?: Metadata['robots']
  alternateLocales?: readonly string[]
}

export const BLOG_LOCALES = ['en', 'es'] as const

function routeHref(path: AppPathnames, params?: RouteParams) {
  return params ? { pathname: path, params } : { pathname: path }
}

/** Localized public path (without origin) for a route and locale. */
export function localizedPath(
  locale: string,
  path: AppPathnames,
  params?: RouteParams
): string {
  return getPathname({
    locale: locale as Locale,
    href: routeHref(path, params) as never,
  })
}

/** Absolute, locale-aware URL for a route. */
export function localizedAbsoluteUrl(
  locale: string,
  path: AppPathnames,
  params?: RouteParams
): string {
  return `${SITE_URL}${localizedPath(locale, path, params)}`
}

export function buildLanguageAlternates(
  path: AppPathnames,
  locales: readonly string[] = routing.locales,
  params?: RouteParams
) {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = localizedAbsoluteUrl(locale, path, params)
  }
  return languages
}

export function buildPageMetadata({
  locale,
  path,
  params,
  title,
  description,
  keywords,
  type = 'website',
  robots,
  alternateLocales,
}: PageMetadataOptions): Metadata {
  const canonical = localizedAbsoluteUrl(locale, path, params)
  const ogLocale = OG_LOCALES[locale] ?? OG_LOCALES.en
  const locales = alternateLocales ?? routing.locales
  const alternateLocale = locales
    .filter((item) => item !== locale)
    .map((item) => OG_LOCALES[item])
    .filter(Boolean)

  return {
    title: title.includes('League Roulette') ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    ...(robots ? { robots } : {}),
    alternates: {
      canonical,
      languages: {
        ...buildLanguageAlternates(path, locales, params),
        'x-default': localizedAbsoluteUrl('en', path, params),
      },
    },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: 'League Roulette',
      locale: ogLocale,
      alternateLocale,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'League Roulette' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
      creator: '@LeagueRoulette',
    },
  }
}
