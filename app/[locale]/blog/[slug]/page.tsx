import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getGraphSchema, getBreadcrumbSchema } from '@/lib/seo-utils'
import { routing } from '@/i18n/routing'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import BlogPostContent from '@/components/blog/BlogPostContent'
import TableOfContents from '@/components/blog/TableOfContents'
import BlogPostCard from '@/components/blog/BlogPostCard'
import PatchTierList from '@/components/blog/PatchTierList'
import Breadcrumbs from '@/components/Breadcrumbs'
import {
  BLOG_SLUGS,
  getPostMeta,
  getAvailableLocales,
  getRelatedSlugs,
  getLocalizedSlug,
  getPostHref,
  resolvePostSlug,
  getSeoTitle,
  getSeoDescription,
  getImageAlt,
} from '@/lib/blog/meta'
import { relatedPosts, formatDate, readingTime, postWordCount } from '@/lib/blog/content'
import type { BlogPost } from '@/lib/blog/content'
import { CATEGORIES } from '@/lib/blog/categories'
import { TIER_ORDER, ROLE_ORDER } from '@/lib/patch-tier-list'
import type { PatchTierListData } from '@/lib/patch-tier-list'

const TIER_LIST_SLUG = 'lol-patch-26-21-tier-list'

type BlogPostPageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of routing.locales) {
    for (const canonicalSlug of BLOG_SLUGS) {
      const localizedSlug = getLocalizedSlug(canonicalSlug, locale)
      params.push({ locale, slug: localizedSlug })
      if (localizedSlug !== canonicalSlug) {
        params.push({ locale, slug: canonicalSlug })
      }
    }
  }
  return params
}

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const { locale, slug } = await props.params
  setRequestLocale(locale)
  const canonicalSlug = resolvePostSlug(slug, locale)
  if (!canonicalSlug) return {}

  const tAll = await getTranslations()

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blog-content') as BlogPost[]
  } catch {
    return {}
  }

  const post = blogPosts.find((p: BlogPost) => p.slug === canonicalSlug)
  if (!post) return {}

  const meta = getPostMeta(canonicalSlug)
  const imageUrl = meta?.image
    ? new URL(meta.image, 'https://leagueroulette.com').toString()
    : 'https://leagueroulette.com/og-image.png'
  const availableLocales = getAvailableLocales(canonicalSlug)
  const publishedDate = meta?.publishedAt ?? ''
  const updatedDate = meta?.updatedAt ?? ''
  const title = getSeoTitle(canonicalSlug, locale) ?? post.title
  const description = getSeoDescription(canonicalSlug, locale) ?? post.description
  const imageAlt = getImageAlt(canonicalSlug, locale) ?? post.title
  const canonicalPath = getPostHref(canonicalSlug, locale)
  const schemaLocale = locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : locale
  const isTranslated = availableLocales.includes(locale)

  return {
    title,
    description,
    authors: [{ name: meta?.author ?? 'League Roulette Team', url: 'https://leagueroulette.com/about' }],
    robots: isTranslated ? undefined : { index: false, follow: true },
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...availableLocales.reduce((acc, l) => {
          acc[l] = `https://leagueroulette.com${getPostHref(canonicalSlug, l)}`
          return acc
        }, {} as Record<string, string>),
        'x-default': `https://leagueroulette.com${getPostHref(canonicalSlug, 'en')}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://leagueroulette.com${canonicalPath}`,
      type: 'article',
      siteName: 'League Roulette',
      publishedTime: publishedDate || new Date().toISOString(),
      modifiedTime: updatedDate || new Date().toISOString(),
      authors: ['https://leagueroulette.com/about'],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
      locale: schemaLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@LeagueRoulette',
    },
    other: {
      'article:section': meta?.category ?? '',
      'article:tag': getRelatedSlugs(canonicalSlug).join(', '),
      'article:published_time': publishedDate || new Date().toISOString(),
      'article:modified_time': updatedDate || publishedDate || new Date().toISOString(),
    },
  }
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { locale, slug } = await props.params
  const canonicalSlug = resolvePostSlug(slug, locale)

  if (!canonicalSlug) {
    notFound()
  }

  const localizedSlug = getLocalizedSlug(canonicalSlug, locale)
  if (slug !== localizedSlug) {
    redirect(getPostHref(canonicalSlug, locale))
  }

  const t = await getTranslations('blog')
  const tAll = await getTranslations()

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blog-content') as BlogPost[]
  } catch {
    blogPosts = []
  }

  const post = blogPosts.find((p: BlogPost) => p.slug === canonicalSlug)
  if (!post) {
    notFound()
  }

  const meta = getPostMeta(canonicalSlug)
  const imageUrl = meta?.image
    ? new URL(meta.image, 'https://leagueroulette.com').toString()
    : 'https://leagueroulette.com/og-image.png'
  const availableLocales = getAvailableLocales(canonicalSlug)
  const category = meta?.category
  const catInfo = category ? CATEGORIES.find(c => c.slug === category) : undefined
  const publishedDate = meta?.publishedAt ? formatDate(meta.publishedAt, locale) : new Date().toISOString().split('T')[0]
  const updatedDate = meta?.updatedAt ? formatDate(meta.updatedAt, locale) : null
  const rt = readingTime(post)
  const related = relatedPosts(blogPosts, canonicalSlug)
  const postPath = getPostHref(canonicalSlug, locale)
  const blogPath = locale === 'en' ? '/blog' : `/${locale}/blog`
  const categoryHref = category
    ? (locale === 'en' ? `/blog/${category}` : `/${locale}/blog/${category}`)
    : blogPath
  const isTierList = canonicalSlug === TIER_LIST_SLUG

  let tierListData: PatchTierListData | null = null
  if (isTierList) {
    try {
      tierListData = tAll.raw('patch-tier-list') as PatchTierListData
    } catch {
      tierListData = null
    }
  }

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
    headline: getSeoTitle(canonicalSlug, locale) ?? post.title,
    description: getSeoDescription(canonicalSlug, locale) ?? post.description,
    inLanguage: locale,
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
    datePublished: meta?.publishedAt ?? publishedDate,
    dateModified: meta?.updatedAt ?? meta?.publishedAt ?? publishedDate,
    mainEntityOfPage: `https://leagueroulette.com${postPath}`,
    keywords: meta?.keywords?.join(', '),
    image: imageUrl,
    articleSection: category,
    wordCount: postWordCount(post),
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: t('home'), path: locale === 'en' ? '/' : `/${locale}` },
    { name: t('blog'), path: blogPath },
    { name: post.title, path: postPath },
  ])

  const tierListSchema = tierListData
    ? {
        '@type': 'ItemList',
        name: `${tierListData.patch} — ${t('blog')}`,
        numberOfItems: ROLE_ORDER.reduce(
          (total, role) =>
            total +
            TIER_ORDER.reduce(
              (roleTotal, tier) =>
                roleTotal + tierListData!.champions.filter((c) => c.role === role && c.tier === tier).length,
              0
            ),
          0
        ),
        itemListElement: ROLE_ORDER.flatMap((role) =>
          TIER_ORDER.flatMap((tier) =>
            tierListData!.champions
              .filter((champion) => champion.role === role && champion.tier === tier)
              .map((champion) => ({
                '@type': 'ListItem',
                name: `${champion.name} — ${tierListData!.roles[role]} (${tier})`,
                item: {
                  '@type': 'Thing',
                  name: champion.name,
                },
              }))
          )
        ).map((item, index) => ({ ...item, position: index + 1 })),
      }
    : null

  const graphSchema = getGraphSchema(
    tierListSchema ? [articleSchema, breadcrumbSchema, tierListSchema] : [articleSchema, breadcrumbSchema]
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 pt-10 pb-12">
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
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: t('blog'), href: '/blog' },
            ...(catInfo ? [{ label: catInfo.name, href: `/blog/${category}` }] : []),
            { label: post.title },
          ]}
        />

        {/* Language switcher for this post */}
        {availableLocales.length > 1 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-500">{t('availableIn')}</span>
            {availableLocales.map(l => (
              <Link
                key={l}
                href={getPostHref(canonicalSlug, l)}
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
                href={categoryHref}
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

        {/* Article cover */}
        <div className="mb-10 relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-[#C89B3C]/20 via-neutral-900/50 to-cyan-500/10">
          {meta?.image ? (
            <Image
              src={meta.image}
              alt={getImageAlt(canonicalSlug, locale) ?? post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          ) : (
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
          )}
        </div>

        {isTierList && tierListData ? (
          <PatchTierList data={tierListData} locale={locale} />
        ) : null}

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
                  href={locale === 'en' ? '/' : `/${locale}`}
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
                  href={locale === 'en' ? '/' : `/${locale}`}
                  className="rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
                >
                  {t('tryApp')}
                </Link>
                <Link
                  href={blogPath}
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