import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import { getGraphSchema, getBreadcrumbSchema } from '@/lib/seo-utils'
import { routing } from '@/i18n/routing'
import Link from 'next/link'
import Script from 'next/script'
import BlogPostContent from '@/components/blog/BlogPostContent'
import TableOfContents from '@/components/blog/TableOfContents'
import BlogPostCard from '@/components/blog/BlogPostCard'
import { getPostMeta, getAvailableLocales, getRelatedSlugs } from '@/lib/blog/meta'
import { relatedPosts, formatDate, readingTime } from '@/lib/blog/content'
import type { BlogPost } from '@/lib/blog/content'
import { CATEGORIES } from '@/lib/blog/categories'

type BlogPostPageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of routing.locales) {
    for (const slug of routing.locales) {
      // Actually we need post slugs. Let's import from meta.
      const { BLOG_SLUGS } = await import('@/lib/blog/meta')
      for (const s of BLOG_SLUGS) {
        params.push({ locale, slug: s })
      }
    }
  }
  return params
}

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const { locale, slug } = await props.params
  const tAll = await getTranslations()

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blog-content') as BlogPost[]
  } catch {
    return {}
  }

  const post = blogPosts.find((p: BlogPost) => p.slug === slug)
  if (!post) return {}

  const meta = getPostMeta(slug)
  const availableLocales = getAvailableLocales(slug)
  const publishedDate = meta?.publishedAt ?? ''
  const updatedDate = meta?.updatedAt ?? ''
  const related = relatedPosts(blogPosts, slug)

  return {
    title: meta?.seoTitle ?? `${post.title} | League Roulette Blog`,
    description: meta?.seoDescription ?? post.description,
    keywords: meta?.keywords,
    authors: [{ name: meta?.author ?? 'League Roulette Team', url: 'https://leagueroulette.com/about' }],
    alternates: {
      canonical: locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`,
      languages: availableLocales.reduce((acc, l) => {
        acc[l] = l === 'en'
          ? `https://leagueroulette.com/blog/${slug}`
          : `https://leagueroulette.com/${l}/blog/${slug}`
        return acc
      }, {} as Record<string, string>),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://leagueroulette.com${locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`}`,
      type: 'article',
      siteName: 'League Roulette',
      publishedTime: publishedDate || new Date().toISOString(),
      modifiedTime: updatedDate || new Date().toISOString(),
      authors: ['https://leagueroulette.com/about'],
      images: [{ url: 'https://leagueroulette.com/og-image.png', width: 1200, height: 630, alt: post.title }],
      locale: locale === 'en' ? 'en_US' : locale.replace('-CN', '-CN'),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['https://leagueroulette.com/og-image.png'],
      creator: '@LeagueRoulette',
    },
    other: {
      'article:section': meta?.category ?? '',
      'article:tag': getRelatedSlugs(slug).join(', '),
      'article:published_time': publishedDate || new Date().toISOString(),
      'article:modified_time': updatedDate || publishedDate || new Date().toISOString(),
    },
  }
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { locale, slug } = await props.params
  const t = await getTranslations('blog')
  const tAll = await getTranslations()

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blog-content') as BlogPost[]
  } catch {
    blogPosts = []
  }

  const post = blogPosts.find((p: BlogPost) => p.slug === slug)
  if (!post) {
    notFound()
  }

  const meta = getPostMeta(slug)
  const availableLocales = getAvailableLocales(slug)
  const category = meta?.category
  const catInfo = category ? CATEGORIES.find(c => c.slug === category) : undefined
  const publishedDate = meta?.publishedAt ? formatDate(meta.publishedAt, locale) : new Date().toISOString().split('T')[0]
  const updatedDate = meta?.updatedAt ? formatDate(meta.updatedAt, locale) : null
  const rt = readingTime(post)
  const related = relatedPosts(blogPosts, slug)

  // TOC items
  const tocItems = post.sections
    .filter(s => s.heading.trim())
    .map((section, i) => ({
      id: `section-${i}`,
      text: section.heading,
      level: 2 as const
    }))

  // Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: meta?.author ?? 'League Roulette Team',
      url: 'https://leagueroulette.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'League Roulette',
      logo: {
        '@type': 'ImageObject',
        url: 'https://leagueroulette.com/og-image.png',
      },
    },
    datePublished: publishedDate,
    dateModified: updatedDate ?? meta?.publishedAt,
    mainEntityOfPage: `https://leagueroulette.com${locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`}`,
    keywords: meta?.keywords?.join(', '),
    image: 'https://leagueroulette.com/og-image.png',
    articleSection: category,
    wordCount: post.sections.reduce((acc, s) =>
      acc + (s.paragraphs ?? []).join(' ').split(/\s+/).length, 0) + post.heroIntro.join(' ').split(/\s+/).length,
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: t('home'), path: '/' },
    { name: t('blog'), path: '/blog' },
    { name: post.title, path: `/blog/${slug}` },
  ])

  const graphSchema = getGraphSchema([articleSchema, breadcrumbSchema])

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-12">
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToBlog')}
        </Link>

        {/* Language switcher for this post */}
        {availableLocales.length > 1 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-500">{t('availableIn')}</span>
            {availableLocales.map(l => (
              <Link
                key={l}
                href={l === 'en' ? `/blog/${slug}` : `/${l}/blog/${slug}`}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${l === locale
                  ? 'bg-[#C89B3C] text-neutral-950'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
        )}

        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            {catInfo && (
              <Link
                href={`/blog/${category}`}
                className="px-3 py-1 rounded-full bg-[#C89B3C]/20 text-[#C89B3C] font-medium hover:bg-[#C89B3C]/30 transition"
              >
                {catInfo.name}
              </Link>
            )}
            <time dateTime={meta?.publishedAt ?? ''}>
              {t('published')}: {publishedDate}
            </time>
            {updatedDate && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={meta?.updatedAt ?? ''}>
                  {t('updated')}: {updatedDate}
                </time>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {rt} {t('readTime', { n: rt })}
            </span>
            {meta?.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>{t('by')} {meta.author}</span>
              </>
            )}
          </div>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          <div className="space-y-4 text-lg leading-8 text-neutral-300 max-w-3xl">
            {post.heroIntro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </header>

        {/* Hero visual placeholder */}
        <div className="mb-10 relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-[#C89B3C]/20 via-neutral-900/50 to-cyan-500/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl opacity-30">
              {catInfo?.name.includes('Champion') ? '⚔️' :
                catInfo?.name.includes('Guide') ? '📖' :
                catInfo?.name.includes('Tier') ? '🏆' :
                catInfo?.name.includes('Beginner') ? '🌱' :
                catInfo?.name.includes('Ranked') ? '📈' :
                catInfo?.name.includes('Mechanic') ? '⚙️' :
                '🎲'}
            </span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-8">
            <BlogPostContent post={post} locale={locale} />

            {/* Mid-article CTA */}
            {post.sections.length >= 3 && (
              <section className="my-12 rounded-3xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-8">
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
            )}

            {/* Final CTA */}
            <section className="my-12 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
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
                  href="/blog"
                  className="rounded-xl bg-neutral-800 px-6 py-3 font-semibold text-white transition hover:bg-neutral-700"
                >
                  {t('browseMore')}
                </Link>
              </div>
            </section>

            {/* Related Articles */}
            {related.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-5 text-2xl font-semibold text-white">
                  {t('relatedReading')}
                </h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {related.map((relatedPost, idx) => (
                    <BlogPostCard key={relatedPost.slug} post={relatedPost} locale={locale} index={idx} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - TOC */}
          <aside className="hidden lg:block lg:col-span-4">
            <TableOfContents items={tocItems} />
          </aside>
        </div>
      </article>
    </main>
  )
}