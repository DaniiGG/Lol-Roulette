import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import { routing } from '@/i18n/routing'
import { BLOG_SLUGS, blogKeywords } from "@/lib/blog-posts"

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
  'top-lane': { title: 'Top Lane Champions Guide | League Roulette', description: 'Best top lane champions for ranked and ARAM. Find your carry pick with our comprehensive guide.', keywords: ['top lane champions', 'best top lane', 'top lane guide', 'lol top lane', 'ranked top lane'] },
  'mid-lane': { title: 'Mid Lane Champions Guide | League Roulette', description: 'Best mid lane champions for every playstyle. Control mages, assassins, and carries covered.', keywords: ['mid lane champions', 'best mid lane', 'mid lane guide', 'lol mid lane', 'mid lane meta'] },
  'adc': { title: 'ADC Carry Champions Guide | League Roulette', description: 'Best ADC carries for climbing ranked. Hyper carries and consistent marksmen covered.', keywords: ['ADC champions', 'ADC carry guide', 'best ADC', 'lol ADC', 'ranked ADC picks'] },
  'support': { title: 'Support Champions Guide | League Roulette', description: 'Best support champions for ranked and ARAM. Engage, peel, and utility supports covered.', keywords: ['support champions', 'best support', 'support guide', 'lol support', 'ranked support'] },
  'aram': { title: 'ARAM Champion Pool Guide | League Roulette', description: 'Build the ultimate ARAM champion pool. Best champions for Howling Abyss chaos.', keywords: ['ARAM champion pool', 'best ARAM champions', 'ARAM guide', 'lol ARAM', 'Howling Abyss'] },
}

function getLanePosts(posts: BlogPost[], lane: string): BlogPost[] {
  const laneKeywords = LANE_META[lane]?.keywords || []
  return posts.filter(p => {
    const allText = (p.title + p.description + p.excerpt).toLowerCase()
    return laneKeywords.some(kw => allText.includes(kw.toLowerCase()))
  })
}

export async function generateStaticParams() {
  const lanes = ['top-lane', 'mid-lane', 'adc', 'support', 'aram']
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
  const meta = LANE_META[lane]
  if (!meta) return {}
  const t = await getTranslations('blog')
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: locale === 'en' ? `/${lane}` : `/${locale}/${lane}`, languages: getHreflangAlternates(`/${lane}`) },
    openGraph: { title: meta.title, description: meta.description, url: `/${lane}`, type: 'website' },
  }
}

export default async function LanePage({ params }: { params: Promise<{ locale: string; lane: string }> }) {
  const { locale, lane } = await params
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  const tAll = await getTranslations()

  let allPosts: BlogPost[] = []
  try { allPosts = tAll.raw('blogContent') as BlogPost[] } catch { allPosts = [] }

  const lanePosts = allPosts.filter(p => {
    const laneKey = lane === 'adc' ? 'adc' : lane
    const allText = (p.title + p.description + p.excerpt).toLowerCase()
    const laneKeywords = LANE_META[lane]?.keywords || []
    return laneKeywords.some(kw => allText.includes(kw.toLowerCase()))
  })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://leagueroulette.com` },
      { '@type': 'ListItem', position: 2, name: t('blog') || 'Blog', item: `https://leagueroulette.com/blog` },
      { '@type': 'ListItem', position: 3, name: LANE_META[lane]?.title || lane, item: `https://leagueroulette.com/${lane}` },
    ],
  }

  const meta = LANE_META[lane]
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/blog" className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white">
            <span aria-hidden="true">←</span> {t('back') || 'Back'}
          </Link>
          <h1 className="mb-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">{meta?.title || lane}</h1>
          <p className="max-w-2xl text-lg leading-8 text-neutral-300">{meta?.description}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {lanePosts.map((post: BlogPost) => (
            <article key={post.slug} className="flex h-full flex-col rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="mb-3 text-2xl font-semibold text-white">{post.title}</h2>
              <p className="mb-4 leading-7 text-neutral-400">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="inline-flex w-fit items-center rounded-xl bg-[#C89B3C] px-4 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]">
                {post.ctaLabel || 'Read More'}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
