// app/sitemap.ts
import { MetadataRoute } from 'next'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { BLOG_CATEGORY_ROUTES, type AppPathnames, type Locale } from '@/i18n/routes'
import { BLOG_SLUGS, getPostHref, getPostMeta } from '@/lib/blog/meta'
import { CATEGORIES } from '@/lib/blog/categories'
import {
  GUIDE_CHAMPIONS,
  GUIDE_LOCALES,
  getGuideHref,
  getGuideIndexHref,
} from '@/lib/guides/meta'
import { SITE_URL } from '@/lib/site'

const baseUrl = SITE_URL

// The blog and champion guides are only published in English and Spanish.
const blogLocales = ['en', 'es'] as const

const staticPages: Array<{
  path: AppPathnames
  priority: number
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
}> = [
  { path: '/', priority: 1, freq: 'daily' },
  { path: '/find-your-main', priority: 0.9, freq: 'weekly' },
  { path: '/howtoplay', priority: 0.9, freq: 'weekly' },
  { path: '/faq', priority: 0.8, freq: 'weekly' },
  { path: '/tips', priority: 0.7, freq: 'weekly' },
  { path: '/leaderboard', priority: 0.7, freq: 'daily' },
  { path: '/modes', priority: 0.7, freq: 'weekly' },
  { path: '/popular', priority: 0.7, freq: 'weekly' },
  { path: '/tierlist', priority: 0.7, freq: 'daily' },
  { path: '/challenges', priority: 0.7, freq: 'weekly' },
  { path: '/about', priority: 0.5, freq: 'monthly' },
  { path: '/contact', priority: 0.5, freq: 'monthly' },
  { path: '/privacy', priority: 0.3, freq: 'yearly' },
  { path: '/terms', priority: 0.3, freq: 'yearly' },
  { path: '/top-lane', priority: 0.6, freq: 'weekly' },
  { path: '/mid-lane', priority: 0.6, freq: 'weekly' },
  { path: '/adc', priority: 0.6, freq: 'weekly' },
  { path: '/support', priority: 0.6, freq: 'weekly' },
  { path: '/aram', priority: 0.6, freq: 'weekly' },
]

function localizedUrl(locale: string, pathname: AppPathnames, params?: Record<string, string>) {
  const path = getPathname({
    locale: locale as Locale,
    href: (params ? { pathname, params } : { pathname }) as never,
  })
  return `${baseUrl}${path}`
}

function buildAlternates(
  pathname: AppPathnames,
  locales: readonly string[],
  params?: Record<string, string>
) {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = localizedUrl(locale, pathname, params)
  }
  languages['x-default'] = localizedUrl('en', pathname, params)
  return { languages }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []
  const now = new Date()

  // Static pages available in every locale (mastery is noindex).
  for (const page of staticPages) {
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, page.path),
        lastModified: now,
        changeFrequency: page.freq,
        priority: page.priority,
        alternates: buildAlternates(page.path, routing.locales),
      })
    }
  }

  // Interactive champion mastery tree (English and Spanish only).
  for (const locale of blogLocales) {
    entries.push({
      url: localizedUrl(locale, '/mastery-tree'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: buildAlternates('/mastery-tree', blogLocales),
    })
  }

  // Blog index.
  for (const locale of blogLocales) {
    entries.push({
      url: localizedUrl(locale, '/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: buildAlternates('/blog', blogLocales),
    })
  }

  // Blog posts with real lastModified dates.
  for (const locale of blogLocales) {
    for (const slug of BLOG_SLUGS) {
      const meta = getPostMeta(slug)
      const lastMod = meta?.updatedAt ? new Date(meta.updatedAt) : new Date(meta?.publishedAt ?? '')
      const languages: Record<string, string> = {}
      for (const altLocale of blogLocales) {
        languages[altLocale] = `${baseUrl}${getPostHref(slug, altLocale)}`
      }
      languages['x-default'] = `${baseUrl}${getPostHref(slug, 'en')}`

      entries.push({
        url: `${baseUrl}${getPostHref(slug, locale)}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages },
      })
    }
  }

  // Champion guide directory and detail pages.
  for (const locale of GUIDE_LOCALES) {
    entries.push({
      url: `${baseUrl}${getGuideIndexHref(locale)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: buildAlternates('/blog/guides', GUIDE_LOCALES),
    })

    for (const guide of GUIDE_CHAMPIONS) {
      const languages: Record<string, string> = {}
      for (const altLocale of GUIDE_LOCALES) {
        languages[altLocale] = `${baseUrl}${getGuideHref(guide.slug, altLocale)}`
      }
      languages['x-default'] = `${baseUrl}${getGuideHref(guide.slug, 'en')}`

      entries.push({
        url: `${baseUrl}${getGuideHref(guide.slug, locale)}`,
        lastModified: new Date(guide.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.75,
        alternates: { languages },
      })
    }
  }

  // Category pages.
  for (const locale of blogLocales) {
    for (const cat of CATEGORIES) {
      const pathname = BLOG_CATEGORY_ROUTES[cat.slug as keyof typeof BLOG_CATEGORY_ROUTES]
      if (!pathname || cat.slug === 'guides') continue

      let newestDate = new Date(0)
      for (const slug of BLOG_SLUGS) {
        const m = getPostMeta(slug)
        if (m?.category !== cat.slug) continue
        const dateValue = m.updatedAt ?? m.publishedAt
        if (!dateValue) continue
        const d = new Date(dateValue)
        if (d > newestDate) newestDate = d
      }

      entries.push({
        url: localizedUrl(locale, pathname),
        lastModified: newestDate,
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: buildAlternates(pathname, blogLocales),
      })
    }
  }

  return entries
}
