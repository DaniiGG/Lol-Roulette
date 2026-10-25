import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

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

type PageMetadataOptions = {
  locale: string
  path: string
  title: string
  description: string
  keywords?: string[]
  type?: 'website' | 'article'
  robots?: Metadata['robots']
  alternateLocales?: readonly string[]
}

export const BLOG_LOCALES = ['en', 'es'] as const

export function localizedPath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`
}

export function buildLanguageAlternates(path: string, locales: readonly string[] = routing.locales) {
  return Object.fromEntries(
    locales.map((locale) => [locale, localizedPath(locale, path)])
  ) as Record<string, string>
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  type = 'website',
  robots,
  alternateLocales = routing.locales,
}: PageMetadataOptions): Metadata {
  const canonical = localizedPath(locale, path)
  const ogLocale = OG_LOCALES[locale] ?? OG_LOCALES.en
  const alternateLocale = alternateLocales
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
        ...buildLanguageAlternates(path, alternateLocales),
        'x-default': localizedPath(routing.defaultLocale, path),
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
