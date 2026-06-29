// app/sitemap.ts
import { MetadataRoute } from 'next'
import { BLOG_SLUGS } from '@/lib/blog-posts'
import { routing } from '@/i18n/routing'

const baseUrl = 'https://leagueroulette.com'

const staticPages = [
  { path: '', priority: 1, freq: 'daily' as const },
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

  for (const slug of BLOG_SLUGS) {
    entries.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })
  }

  return entries
}

