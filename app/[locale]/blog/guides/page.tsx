import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import BlogPostCard from '@/components/blog/BlogPostCard'
import GuideDirectory from '@/components/guides/GuideDirectory'
import type { GuideDirectoryItem } from '@/components/guides/GuideDirectory'
import { formatDate } from '@/lib/blog/content'
import { postsByCategory, sortByPublishedDesc } from '@/lib/blog/content'
import type { BlogPost } from '@/lib/blog/content'
import { BLOG_LOCALES, buildPageMetadata } from '@/lib/seo/page-metadata'
import { asGuideContentFile, getGuideDirectory, guideReadingTime } from '@/lib/guides/content'
import {
  GUIDE_LOCALES,
  GUIDE_PATCH,
  getGuideHref,
  getGuideMeta,
  isGuideLocale,
} from '@/lib/guides/meta'

const GUIDE_PATH = '/blog/guides'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('guide-ui')
  const isTranslated = isGuideLocale(locale)

  return buildPageMetadata({
    locale,
    path: GUIDE_PATH,
    title: t('directory.title'),
    description: t('directory.description'),
    alternateLocales: GUIDE_LOCALES,
    robots: isTranslated ? undefined : { index: false, follow: true },
  })
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('guide-ui')
  const tBlog = await getTranslations('blog')
  const tAll = await getTranslations()

  let file: ReturnType<typeof asGuideContentFile> = null
  try {
    file = asGuideContentFile(tAll.raw('champion-guide-content'))
  } catch {
    file = null
  }

  const guides = getGuideDirectory(file)
  const items: GuideDirectoryItem[] = guides.flatMap((guide) => {
    const meta = getGuideMeta(guide.slug)
    if (!meta) return []
    return [
      {
        slug: guide.slug,
        name: guide.name,
        title: guide.title,
        role: guide.role,
        roleLabel: guide.roleLabel,
        roles: meta.roles,
        tagline: guide.tagline,
        difficultyLabel: guide.difficultyLabel,
        splash: meta.splash,
        href: getGuideHref(guide.slug, isGuideLocale(locale) ? locale : 'en'),
        updatedLabel: t('directory.updated', { date: formatDate(meta.updatedAt, locale) }),
        patchLabel: t('directory.patch', { patch: GUIDE_PATCH }),
        readingTime: guideReadingTime(guide),
        winRate: meta.stats[0]?.winRate ?? '—',
        availableLocales: [...GUIDE_LOCALES],
      },
    ]
  })

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blog-content') as BlogPost[]
  } catch {
    blogPosts = []
  }
  const categoryPosts = sortByPublishedDesc(postsByCategory(blogPosts, 'guides'))

  const blogHref = locale === 'en' ? '/blog' : `/${locale}/blog`
  const isTranslated = BLOG_LOCALES.includes(locale as (typeof BLOG_LOCALES)[number])

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-4 pb-12 pt-8 md:px-6 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: tBlog('blog'), href: '/blog' },
            { label: t('directory.breadcrumb') },
          ]}
        />

        <header className="mb-10 overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-900/60 p-6 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#C89B3C]">
                <Sparkles className="h-4 w-4" />
                {t('directory.eyebrow')}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{t('directory.title')}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-300">{t('directory.description')}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-[#C89B3C]/30 bg-[#C89B3C]/10 px-3 py-1.5 font-semibold text-[#C89B3C]">
                {t('directory.patch', { patch: GUIDE_PATCH })}
              </span>
              <span className="rounded-full border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 text-neutral-300">
                {t('directory.results', { count: items.length })}
              </span>
              <span className="rounded-full border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 text-neutral-300">
                {t('directory.availableIn')}: {GUIDE_LOCALES.map((guideLocale) => guideLocale.toUpperCase()).join(' / ')}
              </span>
            </div>
          </div>
        </header>

        {!isTranslated ? (
          <div className="mb-8 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm leading-6 text-amber-100/80">
            {t('directory.englishNotice')}
          </div>
        ) : null}

        <GuideDirectory items={items} />

        <section className="mt-16 border-t border-neutral-800 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                <BookOpen className="h-5 w-5 text-[#C89B3C]" />
                {t('directory.blogTitle')}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">{t('directory.blogDescription')}</p>
            </div>
            <Link
              href={blogHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C89B3C] transition hover:text-[#e8c77e]"
            >
              {t('directory.viewAllArticles')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {categoryPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryPosts.slice(0, 6).map((post, index) => (
                <BlogPostCard key={post.slug} post={post} locale={locale} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-8 text-sm text-neutral-400">
              {tBlog('noPostsInCategory')}
            </div>
          )}
        </section>

        <section className="mt-14 rounded-3xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-8">
          <h2 className="mb-3 text-2xl font-semibold text-white">{t('guide.ctaTitle')}</h2>
          <p className="mb-6 max-w-3xl text-base leading-7 text-neutral-300">{t('guide.ctaDescription')}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={locale === 'en' ? '/' : `/${locale}`}
              className="rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
            >
              {t('guide.ctaButton')}
            </Link>
            <Link
              href={blogHref}
              className="rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-3 font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-800"
            >
              {t('directory.viewAllArticles')}
            </Link>
          </div>
        </section>

      </div>
    </main>
  )
}
