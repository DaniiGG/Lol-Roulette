// app/sitemap.ts
import { MetadataRoute } from 'next'
import { BLOG_SLUGS, getLocalizedSlug, getPostMeta } from '@/lib/blog/meta'
import { CATEGORIES } from '@/lib/blog/categories'
import { routing } from '@/i18n/routing'

const baseUrl = 'https://leagueroulette.com'

// El blog solo está publicado en inglés y español; el resto generaría
// páginas inútiles (contenido en inglés o sin traducir) en el sitemap.
const blogLocales = ['en', 'es'] as const

const staticPages = [
  { path: '', priority: 1, freq: 'daily' as const },
  { path: 'find-your-main', priority: 0.9, freq: 'weekly' as const },
  { path: 'howtoplay', priority: 0.9, freq: 'weekly' as const },
  { path: 'faq', priority: 0.8, freq: 'weekly' as const },
  { path: 'tips', priority: 0.7, freq: 'weekly' as const },
  { path: 'leaderboard', priority: 0.7, freq: 'daily' as const },
  { path: 'modes', priority: 0.7, freq: 'weekly' as const },
  { path: 'popular', priority: 0.7, freq: 'weekly' as const },
  { path: 'tierlist', priority: 0.7, freq: 'daily' as const },
  { path: 'challenges', priority: 0.7, freq: 'weekly' as const },
  { path: 'about', priority: 0.5, freq: 'monthly' as const },
  { path: 'contact', priority: 0.5, freq: 'monthly' as const },
  { path: 'privacy', priority: 0.3, freq: 'yearly' as const },
  { path: 'terms', priority: 0.3, freq: 'yearly' as const },
  { path: 'top-lane', priority: 0.6, freq: 'weekly' as const },
  { path: 'mid-lane', priority: 0.6, freq: 'weekly' as const },
  { path: 'adc', priority: 0.6, freq: 'weekly' as const },
  { path: 'support', priority: 0.6, freq: 'weekly' as const },
  { path: 'aram', priority: 0.6, freq: 'weekly' as const },
]

function localizedUrl(locale: string, path: string) {
  const localePath = locale === routing.defaultLocale ? '' : `/${locale}`
  return `${baseUrl}${localePath}${path}`
}

function buildAlternates(path: string, locales: readonly string[]) {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = localizedUrl(locale, path)
  }
  languages['x-default'] = localizedUrl(routing.defaultLocale, path)
  return { languages }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []
  const now = new Date()

  // Static pages available in every locale (mastery is noindex).
  for (const page of staticPages) {
    const pagePath = page.path ? `/${page.path}` : ''
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, pagePath),
        lastModified: now,
        changeFrequency: page.freq,
        priority: page.priority,
        alternates: buildAlternates(pagePath, routing.locales),
      })
    }
  }

  // Blog index is only published in English and Spanish.
  for (const locale of blogLocales) {
    entries.push({
      url: localizedUrl(locale, '/blog'),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: buildAlternates('/blog', blogLocales),
    })
  }

  // Blog posts with real lastModified dates
  for (const locale of blogLocales) {
    for (const slug of BLOG_SLUGS) {
      const localizedSlug = getLocalizedSlug(slug, locale)
      const meta = getPostMeta(slug)
      const lastMod = meta?.updatedAt ? new Date(meta.updatedAt) : new Date(meta?.publishedAt ?? '')
      const languages: Record<string, string> = {}
      for (const altLocale of blogLocales) {
        languages[altLocale] = localizedUrl(altLocale, `/blog/${getLocalizedSlug(slug, altLocale)}`)
      }
      languages['x-default'] = localizedUrl(routing.defaultLocale, `/blog/${getLocalizedSlug(slug, routing.defaultLocale)}`)

      entries.push({
        url: localizedUrl(locale, `/blog/${localizedSlug}`),
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: { languages },
      })
    }
  }

  // Category pages
  for (const locale of blogLocales) {
    for (const cat of CATEGORIES) {
      const catSlug = cat.slug
      // Use the most recent post in this category for lastmod
      let newestDate = new Date(0)
      for (const slug of BLOG_SLUGS) {
        const m = getPostMeta(slug)
        if (m?.category !== catSlug) continue
        const dateValue = m.updatedAt ?? m.publishedAt
        if (!dateValue) continue
        const d = new Date(dateValue)
        if (d > newestDate) newestDate = d
      }
      entries.push({
        url: localizedUrl(locale, `/blog/${catSlug}`),
        lastModified: newestDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        alternates: buildAlternates(`/blog/${catSlug}`, blogLocales),
      })
    }
  }

  return entries
}