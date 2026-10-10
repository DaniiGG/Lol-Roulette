import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import CategoryView from '@/components/blog/CategoryView'
import { postsByCategory, sortByPublishedDesc } from '@/lib/blog/content'
import type { BlogPost } from '@/lib/blog/content'
import { CATEGORIES } from '@/lib/blog/categories'

const CATEGORY_SLUG = 'league-roulette'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('blog')
  return {
    title: `${t(`categories.${CATEGORY_SLUG}.name`)} | League Roulette Blog`,
    description: t(`categories.${CATEGORY_SLUG}.desc`),
    alternates: {
      canonical: locale === 'en' ? `/blog/${CATEGORY_SLUG}` : `/${locale}/blog/${CATEGORY_SLUG}`,
      languages: getHreflangAlternates(`/blog/${CATEGORY_SLUG}`),
    },
    openGraph: {
      title: `${t(`categories.${CATEGORY_SLUG}.name`)} | League Roulette`,
      description: t(`categories.${CATEGORY_SLUG}.desc`),
      url: locale === 'en' ? `/blog/${CATEGORY_SLUG}` : `/${locale}/blog/${CATEGORY_SLUG}`,
      type: 'website',
      siteName: 'League Roulette',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: t(`categories.${CATEGORY_SLUG}.name`) }],
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('blog')
  const tAll = await getTranslations()

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blog-content') as BlogPost[]
  } catch {
    blogPosts = []
  }

  const catPosts = postsByCategory(blogPosts, CATEGORY_SLUG as any)
  const sortedPosts = sortByPublishedDesc(catPosts)

  return (
    <CategoryView
      posts={blogPosts}
      locale={locale}
      categorySlug={CATEGORY_SLUG}
      t={t}
    />
  )
}