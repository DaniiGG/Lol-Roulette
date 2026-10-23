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
  { path: 'blog', priority: 0.8, freq: 'weekly' as const },
  { path: 'tips', priority: 0.7, freq: 'weekly' as const },
  { path: 'leaderboard', priority: 0.7, freq: 'daily' as const },
  { path: 'mastery', priority: 0.6, freq: 'weekly' as const },
  { path: 'about', priority: 0.5, freq: 'monthly' as const },
  { path: 'contact', priority: 0.5, freq: 'monthly' as const },
  { path: 'privacy', priority: 0.3, freq: 'yearly' as const },
  { path: 'terms', priority: 0.3, freq: 'yearly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  // Static pages
  for (const page of staticPages) {
    for (const locale of routing.locales) {
      const localePath = locale === routing.defaultLocale ? '' : `/${locale}`
      const pagePath = page.path ? `/${page.path}` : ''
      entries.push({
        url: `${baseUrl}${localePath}${pagePath}`,
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
      })
    }
  }

  // Blog posts with real lastModified dates
  for (const locale of blogLocales) {
    const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`
    for (const slug of BLOG_SLUGS) {
      const meta = getPostMeta(slug)
      const lastMod = meta?.updatedAt ? new Date(meta.updatedAt) : new Date(meta?.publishedAt ?? '')
      entries.push({
        url: `${baseUrl}${localePrefix}/blog/${getLocalizedSlug(slug, locale)}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    }
  }

  // Category pages
  for (const locale of blogLocales) {
    const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`
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
        url: `${baseUrl}${localePrefix}/blog/${catSlug}`,
        lastModified: newestDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    }
  }

  return entries
}