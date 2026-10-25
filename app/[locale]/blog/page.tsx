import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { BLOG_LOCALES, buildPageMetadata } from '@/lib/seo/page-metadata'
import BlogSearch from '@/components/blog/BlogSearch'
import BlogPostCard from '@/components/blog/BlogPostCard'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import { postsByCategory, sortByPublishedDesc, formatDate } from '@/lib/blog/content'
import { CATEGORIES } from '@/lib/blog/categories'
import type { BlogPost } from '@/lib/blog/content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  const isTranslated = BLOG_LOCALES.includes(locale as (typeof BLOG_LOCALES)[number])

  return buildPageMetadata({
    locale,
    path: '/blog',
    title: t('heroTitle'),
    description: t('heroDesc'),
    alternateLocales: BLOG_LOCALES,
    robots: isTranslated ? undefined : { index: false, follow: true },
  })
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('blog')
  const tAll = await getTranslations()

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blog-content') as BlogPost[]
  } catch {
    blogPosts = []
  }

  const sortedPosts = sortByPublishedDesc(blogPosts)
  const featuredPost = sortedPosts[0]
  const latestPosts = sortedPosts.slice(1, 10)

  // Category counts
  const categoryCounts = CATEGORIES.map(cat => ({
    slug: cat.slug,
    name: t(`categories.${cat.slug}.name`),
    count: postsByCategory(blogPosts, cat.slug).length
  })).filter(c => c.count > 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 pt-10 pb-12">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: t('blog') },
          ]}
        />

        {/* Hero */}
        <section className="mb-16 animate-slide-up">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">
            {t('sectionLabel')}
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="max-w-3xl text-lg md:text-xl leading-8 text-neutral-300">
            {t('heroDesc')}
          </p>
        </section>

        {/* Search */}
        <BlogSearch posts={blogPosts} locale={locale} />

        {/* Featured Article */}
        {featuredPost && (
          <section className="mb-16 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <BlogPostCard post={featuredPost} locale={locale} featured={true} index={-1} />
          </section>
        )}

        {/* Latest Articles */}
        <section className="mb-16 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <h2 className="mb-5 text-2xl font-semibold text-white">
            {t('latestLabel')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, idx) => (
              <BlogPostCard key={post.slug} post={post} locale={locale} index={idx} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-16 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="mb-5 text-2xl font-semibold text-white">
            {t('categoriesLabel')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categoryCounts.map((cat, idx) => (
              <Link
                key={cat.slug}
                href={locale === 'en' ? `/blog/${cat.slug}` : `/${locale}/blog/${cat.slug}`}
                className="group p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 transition hover:border-[#C89B3C]/40 hover:bg-neutral-900"
                style={{ animationDelay: `${200 + idx * 30}ms` }}
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#C89B3C]">
                  <span className="text-xl">{cat.count > 10 ? '📚' : cat.count > 5 ? '📖' : '📄'}</span>
                  {cat.name}
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:text-[#C89B3C] transition-colors">
                  {t('categoryCount', { n: cat.count })}
                </h3>
                <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
                  {t(`categories.${cat.slug}.desc`)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Mid CTA */}
        <section className="mb-16 rounded-3xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-8 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <h2 className="mb-3 text-2xl font-semibold text-white">
            {t('ctaMidTitle')}
          </h2>
          <p className="mb-6 max-w-3xl text-lg leading-8 text-neutral-300">
            {t('ctaMidDesc')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
          >
            {t('tryApp')}
          </Link>
        </section>

        {/* Final CTA */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
          <h2 className="mb-3 text-2xl font-semibold text-white">
            {t('ctaTitle')}
          </h2>
          <p className="mb-6 max-w-3xl text-lg leading-8 text-neutral-300">
            {t('ctaDesc')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
            >
              {t('tryApp')}
            </Link>
            <Link
              href="/tips"
              className="rounded-xl bg-neutral-800 px-6 py-3 font-semibold text-white transition hover:bg-neutral-700"
            >
              {t('browseTips')}
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}