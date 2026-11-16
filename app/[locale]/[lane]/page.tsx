import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LaneRoulette from '@/components/LaneRoulette'
import { GUIDE_CHAMPIONS, getGuideHref, isGuideLocale } from '@/lib/guides/meta'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildPageMetadata, localizedPath } from '@/lib/seo/page-metadata'
import { routing } from '@/i18n/routing'
import type { AppPathnames } from '@/i18n/routes'

import { getPostHref } from '@/lib/blog/meta'
import Breadcrumbs from '@/components/Breadcrumbs'

type BlogPost = {
  slug: string
  title: string
  description: string
  excerpt: string
  ctaLabel: string
  heroIntro: string[]
  sections: { heading: string; paragraphs: string[] }[]
}

const LANE_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  'jungle': { title: 'Jungle Champion Roulette', description: 'Pick a random jungler.', keywords: ['jungle', 'jungla', 'jungler'] },
  'top-lane': { title: 'Top Lane Champions Guide | League Roulette', description: 'Best top lane champions for ranked and ARAM. Find your carry pick with our comprehensive guide.', keywords: ['top lane champions', 'best top lane', 'top lane guide', 'lol top lane', 'ranked top lane'] },
  'mid-lane': { title: 'Mid Lane Champions Guide | League Roulette', description: 'Best mid lane champions for every playstyle. Control mages, assassins, and carries covered.', keywords: ['mid lane champions', 'best mid lane', 'mid lane guide', 'lol mid lane', 'mid lane meta'] },
  'adc': { title: 'ADC Carry Champions Guide | League Roulette', description: 'Best ADC carries for climbing ranked. Hyper carries and consistent marksmen covered.', keywords: ['ADC champions', 'ADC carry guide', 'best ADC', 'lol ADC', 'ranked ADC picks'] },
  'support': { title: 'Support Champions Guide | League Roulette', description: 'Best support champions for ranked and ARAM. Engage, peel, and utility supports covered.', keywords: ['support champions', 'best support', 'support guide', 'lol support', 'ranked support'] },
  'aram': { title: 'ARAM Champion Pool Guide | League Roulette', description: 'Build the ultimate ARAM champion pool. Best champions for Howling Abyss chaos.', keywords: ['ARAM champion pool', 'best ARAM champions', 'ARAM guide', 'lol ARAM', 'Howling Abyss'] },
}

const LANE_ROLE_KEYS: Record<string, string> = {
  'top-lane': 'top',
  'jungle': 'jungle',
  'mid-lane': 'mid',
  'adc': 'adc',
  'support': 'support',
  'aram': 'aram',
}

async function getLaneCopy(lane: string) {
  const t = await getTranslations('page-seo')
  const tLanes = await getTranslations('laneSelector')
  const role = lane === 'aram' ? 'ARAM' : tLanes(LANE_ROLE_KEYS[lane])

  return {
    role,
    title: t('lane.title', { role }),
    description: t('lane.description', { role }),
  }
}

export async function generateStaticParams() {
  const lanes = Object.keys(LANE_META)
  const params: { locale: string; lane: string }[] = []
  for (const locale of routing.locales) {
    for (const lane of lanes) {
      params.push({ locale, lane })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; lane: string }> }): Promise<Metadata> {
  const { locale, lane } = await params
  setRequestLocale(locale)
  if (!Object.hasOwn(LANE_META, lane)) notFound()

  const copy = await getLaneCopy(lane)

  return buildPageMetadata({
    locale,
    path: `/${lane}` as AppPathnames,
    title: copy.title,
    description: copy.description,
  })
}

export default async function LanePage({ params }: { params: Promise<{ locale: string; lane: string }> }) {
  const { locale, lane } = await params
  setRequestLocale(locale)
  if (!Object.hasOwn(LANE_META, lane)) notFound()
  const tQuiz = await getTranslations('quiz')
  const tAll = await getTranslations()

  let allPosts: BlogPost[] = []
  try { allPosts = tAll.raw('blog-content') as BlogPost[] } catch { allPosts = [] }

  const lanePosts = (isGuideLocale(locale) ? allPosts : []).filter(p => {
    const allText = (p.title + p.description + p.excerpt).toLowerCase()
    const laneKeywords = LANE_META[lane]?.keywords || []
    return laneKeywords.some(kw => allText.includes(kw.toLowerCase()))
  })

  const copy = await getLaneCopy(lane)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://leagueroulette.com${localizedPath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: copy.role, item: `https://leagueroulette.com${localizedPath(locale, `/${lane}` as AppPathnames)}` },
    ],
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 pt-10 pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: copy.role },
          ]}
        />

        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">{copy.title}</h1>
          <p className="max-w-2xl text-lg leading-8 text-neutral-300">{copy.description}</p>
        </div>
        <LaneRoulette lane={LANE_ROLE_KEYS[lane]} />
        <nav aria-label={copy.role} className="mb-8 flex flex-wrap gap-4">
          {Object.keys(LANE_META).filter(key => key !== lane).map(key => (
            <Link key={key} href={localizedPath(locale, `/${key}` as AppPathnames)} className="text-[#C89B3C] underline underline-offset-4">
              {key === 'top-lane' ? 'Top' : key === 'mid-lane' ? 'Mid' : key === 'jungle' ? (locale === 'es' ? 'Jungla' : 'Jungle') : key.toUpperCase()}
            </Link>
          ))}
          <Link href={localizedPath(locale, '/find-your-main')} className="text-[#C89B3C] underline underline-offset-4">{tQuiz('navLabel')}</Link>
        </nav>
        {isGuideLocale(locale) && <div className="mb-8 flex flex-wrap gap-4">
          {GUIDE_CHAMPIONS.filter(guide => lane === 'aram' || guide.roles.some(role => role === LANE_ROLE_KEYS[lane])).map(guide => (
            <Link key={guide.slug} href={getGuideHref(guide.slug, locale)} className="text-[#C89B3C] underline underline-offset-4">
              {locale === 'es' ? 'Cómo jugar' : 'How to play'} {guide.championId}
            </Link>
          ))}
        </div>}
        <div className="grid gap-6 md:grid-cols-2">
          {lanePosts.map((post: BlogPost) => (
            <article key={post.slug} className="flex h-full flex-col rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="mb-3 text-2xl font-semibold text-white">{post.title}</h2>
              <p className="mb-4 leading-7 text-neutral-400">{post.excerpt}</p>
              <Link href={getPostHref(post.slug, locale)} className="inline-flex w-fit items-center rounded-xl bg-[#C89B3C] px-4 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]">
                {post.ctaLabel || 'Read More'}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
