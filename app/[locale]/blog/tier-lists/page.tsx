import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { BLOG_LOCALES, buildPageMetadata } from '@/lib/seo/page-metadata'
import CategoryView from '@/components/blog/CategoryView'
import { postsByCategory, sortByPublishedDesc } from '@/lib/blog/content'
import type { BlogPost } from '@/lib/blog/content'

const CATEGORY_SLUG = 'tier-lists'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  const isTranslated = BLOG_LOCALES.includes(locale as (typeof BLOG_LOCALES)[number])

  return buildPageMetadata({
    locale,
    path: `/blog/${CATEGORY_SLUG}`,
    title: t(`categories.${CATEGORY_SLUG}.name`),
    description: t(`categories.${CATEGORY_SLUG}.desc`),
    alternateLocales: BLOG_LOCALES,
    robots: isTranslated ? undefined : { index: false, follow: true },
  })
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