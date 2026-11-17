import { buildPageMetadata, localizedAbsoluteUrl } from '@/lib/seo/page-metadata'
import { SITE_URL } from '@/lib/site'
import { SKIN_LOCALES, skinSplash, type Skin, type SkinLocale } from './data'
import type { AppPathnames } from '@/i18n/routes'

export function skinMetadata({ locale, path, params, title, description, skin, index = true, alternateLocales = SKIN_LOCALES }: { locale: string; path: AppPathnames; params?: Record<string, string>; title: string; description: string; skin?: Skin; index?: boolean; alternateLocales?: readonly string[] }) {
  const metadata = buildPageMetadata({ locale, path, params, title, description, alternateLocales, robots: { index, follow: true, googleBot: { index, follow: true, 'max-image-preview': 'large' } } })
  if (!index) metadata.alternates = { canonical: localizedAbsoluteUrl(locale, path, params) }
  else if (!alternateLocales.includes('en')) metadata.alternates = { ...metadata.alternates, languages: { ...metadata.alternates?.languages, 'x-default': localizedAbsoluteUrl(alternateLocales[0] ?? locale, path, params) } }
  if (skin) {
    const images = [{ url: skinSplash(skin), width: 1215, height: 717, alt: skin.name[locale === 'es' ? 'es' : 'en'] }]
    metadata.openGraph = { ...metadata.openGraph, images }
    metadata.twitter = { ...metadata.twitter, images: [skinSplash(skin)] }
  }
  return metadata
}
export const skinBase = (locale: SkinLocale) => locale === 'es' ? '/es/skins' : '/skins'
export function skinBreadcrumbSchema(locale: SkinLocale, items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ name: 'League Roulette', path: locale === 'es' ? '/es' : '/' }, ...items].map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: `${SITE_URL}${item.path}` })) }
}
