import type { Metadata } from 'next'
import Script from 'next/script'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import GuideArticle from '@/components/guides/GuideArticle'
import { getBreadcrumbSchema, getGraphSchema } from '@/lib/seo-utils'
import { getGuideContent, guideWordCount } from '@/lib/guides/content'
import {
  GUIDE_CHAMPIONS,
  GUIDE_LOCALES,
  GUIDE_PATCH,
  getGuideHref,
  getGuideIndexHref,
  getGuideMeta,
  getGuideSlug,
  getRelatedGuides,
  isGuideLocale,
  resolveGuideSlug,
} from '@/lib/guides/meta'

type GuidePageProps = {
  params: Promise<{
    locale: string
    champion: string
  }>
}

const BASE_URL = 'https://leagueroulette.com'

export async function generateStaticParams() {
  const params: Array<{ locale: string; champion: string }> = []
  for (const locale of GUIDE_LOCALES) {
    for (const guide of GUIDE_CHAMPIONS) {
      const localizedSlug = getGuideSlug(guide.slug, locale)
      params.push({ locale, champion: localizedSlug })
      if (localizedSlug !== guide.slug) {
        params.push({ locale, champion: guide.slug })
      }
    }
  }
  return params
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { locale, champion } = await params
  setRequestLocale(locale)

  if (!isGuideLocale(locale)) {
    return {
      robots: { index: false, follow: false },
    }
  }

  const canonicalSlug = resolveGuideSlug(champion)
  if (!canonicalSlug) return {}

  const meta = getGuideMeta(canonicalSlug)
  if (!meta) return {}

  const tAll = await getTranslations()
  let content: ReturnType<typeof getGuideContent> = undefined
  try {
    content = getGuideContent(tAll.raw('champion-guide-content'), canonicalSlug)
  } catch {
    content = undefined
  }
  if (!content) return {}

  const canonical = getGuideHref(canonicalSlug, locale)
  const languages = Object.fromEntries(
    GUIDE_LOCALES.map((guideLocale) => [
      guideLocale,
      `${BASE_URL}${getGuideHref(canonicalSlug, guideLocale)}`,
    ])
  )
  const image = meta.splash
  const keywords =
    locale === 'es'
      ? [
          `cómo jugar ${content.name}`,
          `${content.name} build`,
          `${content.name} runas`,
          `${content.name} combos`,
          `guía ${content.name} League of Legends`,
          `parche ${GUIDE_PATCH}`,
        ]
      : [
          `how to play ${content.name}`,
          `${content.name} build`,
          `${content.name} runes`,
          `${content.name} combos`,
          `${content.name} guide League of Legends`,
          `patch ${GUIDE_PATCH}`,
        ]

  return {
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    keywords,
    authors: [{ name: 'League Roulette Team', url: `${BASE_URL}/about` }],
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        ...languages,
        'x-default': `${BASE_URL}${getGuideHref(canonicalSlug, 'en')}`,
      },
    },
    openGraph: {
      type: 'article',
      title: content.metaTitle,
      description: content.metaDescription,
      url: `${BASE_URL}${canonical}`,
      siteName: 'League Roulette',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt,
      images: [{ url: image, width: 1215, height: 717, alt: `${content.name} splash art` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
      images: [image],
      creator: '@LeagueRoulette',
    },
    other: {
      'article:section': 'Champion Guides',
      'article:tag': `${content.name}, ${content.roleLabel}, League of Legends, patch ${GUIDE_PATCH}`,
      'article:published_time': meta.publishedAt,
      'article:modified_time': meta.updatedAt,
    },
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { locale, champion } = await params
  setRequestLocale(locale)

  if (!isGuideLocale(locale)) {
    notFound()
  }

  const canonicalSlug = resolveGuideSlug(champion)
  if (!canonicalSlug) {
    notFound()
  }

  const localizedSlug = getGuideSlug(canonicalSlug, locale)
  if (champion !== localizedSlug) {
    redirect(getGuideHref(canonicalSlug, locale))
  }

  const meta = getGuideMeta(canonicalSlug)
  if (!meta) {
    notFound()
  }

  const tAll = await getTranslations()
  let content: ReturnType<typeof getGuideContent> = undefined
  try {
    content = getGuideContent(tAll.raw('champion-guide-content'), canonicalSlug)
  } catch {
    content = undefined
  }
  if (!content) {
    notFound()
  }

  const t = await getTranslations('guide-ui')
  const tBlog = await getTranslations('blog')
  const related = getRelatedGuides(canonicalSlug)
  const canonical = getGuideHref(canonicalSlug, locale)
  const image = meta.splash

  const articleSchema = {
    '@type': 'Article',
    headline: content.metaTitle,
    description: content.metaDescription,
    image,
    inLanguage: locale,
    author: {
      '@type': 'Person',
      name: 'League Roulette Team',
      url: `${BASE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'League Roulette',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/og-image.png`,
      },
    },
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt,
    mainEntityOfPage: `${BASE_URL}${canonical}`,
    articleSection: t('guide.breadcrumb'),
    keywords: [
      `how to play ${content.name}`,
      `${content.name} build`,
      `${content.name} runes`,
      `${content.name} combos`,
      `patch ${GUIDE_PATCH}`,
    ].join(', '),
    wordCount: guideWordCount(content),
    about: {
      '@type': 'VideoGame',
      name: 'League of Legends',
      applicationCategory: 'GameApplication',
    },
    mentions: [
      {
        '@type': 'Thing',
        name: content.name,
      },
    ],
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: tBlog('home'), path: locale === 'en' ? '/' : `/${locale}` },
    { name: tBlog('blog'), path: locale === 'en' ? '/blog' : `/${locale}/blog` },
    { name: t('guide.breadcrumb'), path: getGuideIndexHref(locale) },
    { name: content.h1, path: canonical },
  ])

  const faqSchema = {
    '@type': 'FAQPage',
    mainEntity: content.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const graphSchema = getGraphSchema([articleSchema, breadcrumbSchema, faqSchema])

  return (
    <>
      <Script
        id="guide-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
      <GuideArticle content={content} meta={meta} locale={locale} related={related} />
    </>
  )
}
