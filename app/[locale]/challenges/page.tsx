import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('challenges')
  return {
    title: t('weeklyChallenge.title'),
    description: t('weeklyChallenge.subtitle'),
    alternates: {
      canonical: locale === 'en' ? '/challenges' : `/${locale}/challenges`,
      languages: getHreflangAlternates('/challenges'),
    },
    openGraph: {
      title: t('weeklyChallenge.title'),
      description: t('weeklyChallenge.subtitle'),
      url: locale === 'en' ? '/challenges' : `/${locale}/challenges`,
      siteName: 'League Roulette',
    },
  }
}

function getLaneForChallenge(challengeId: string): string {
  const challengeLanes: Record<string, string> = {
    'support-only': 'support',
    'aram-only': 'aram',
  }
  return challengeLanes[challengeId] || 'all'
}

export default async function ChallengesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('challenges')
  const tAll = await getTranslations()

  let challengeData: any = {}
  try {
    challengeData = tAll.raw('challenges') as any
  } catch {
    challengeData = {}
  }

  const challenges = challengeData?.weeklyChallenge?.challenges || []
  const weeklyChallenge = challengeData?.weeklyChallenge || {}

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span> {t('back') || 'Back'}
        </Link>

        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">
            {t('sectionLabel') || 'Weekly Challenge'}
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {weeklyChallenge.title || t('weeklyChallenge.title')}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-neutral-300">
            {weeklyChallenge.subtitle || t('weeklyChallenge.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge: any, i: number) => {
            const lane = getLaneForChallenge(challenge.id || '')
            return (
              <article
                key={challenge.id || i}
                className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 transition hover:border-[#C89B3C]/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{challenge.emoji || '🎯'}</span>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#C89B3C]/20 text-[#C89B3C]">
                    {challenge.difficulty || 'Medium'}
                  </span>
                </div>
                <h2 className="mb-3 text-2xl font-semibold text-white">{challenge.name || 'Challenge'}</h2>
                <p className="mb-4 leading-7 text-neutral-300">{challenge.description || 'Complete this challenge'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{challenge.deadline || 'This Sunday'}</span>
                  <Link
                    href={`/?challenge=${challenge.id}`}
                    className="rounded-xl bg-[#C89B3C] px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
                  >
                    {t('joinChallenge') || 'Join & Spin'}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        <section className="mt-12 rounded-3xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-8">
          <h2 className="mb-4 text-2xl font-semibold text-white">{t('createChallenge') || 'Create Your Own Challenge'}</h2>
          <p className="mb-6 max-w-2xl text-lg leading-8 text-neutral-300">
            {t('shareCode') || 'Create a custom challenge, share the code with friends, and compete together.'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-xl bg-[#C89B3C] px-5 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
            >
              {t('startPlaying') || 'Start Playing'}
            </Link>
            <Link
              href="/blog"
              className="rounded-xl bg-neutral-800 px-5 py-3 font-semibold text-white transition hover:bg-neutral-700"
            >
              {t('browseMore') || 'Browse Blog'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
