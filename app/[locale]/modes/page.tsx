import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('modes')
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: locale === 'en' ? '/modes' : `/${locale}/modes`,
      languages: getHreflangAlternates('/modes'),
    },
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: locale === 'en' ? '/modes' : `/${locale}/modes`,
      siteName: 'League Roulette',
    },
  }
}

export default async function ModesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('modes')
  const tAll = await getTranslations()

  let modesData: any = {}
  try {
    modesData = tAll.raw('modes') as any
  } catch {
    modesData = {}
  }

  const modes = modesData?.modes || []

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
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">{t('sectionLabel') || 'Game Modes'}</p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t('title')}</h1>
          <p className="max-w-3xl text-lg leading-8 text-neutral-300">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modes.map((mode: any, i: number) => (
            <article
              key={mode.name || i}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 transition hover:border-[#C89B3C]/40"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{mode.icon || '🎮'}</span>
                <div>
                  <h2 className="text-2xl font-semibold text-white">{mode.name || 'Mode'}</h2>
                  <p className="text-sm text-neutral-500">{mode.queueTypes?.join(', ') || ''}</p>
                </div>
              </div>
              <p className="mb-4 leading-7 text-neutral-300">{mode.description || ''}</p>
              <div className="rounded-xl bg-neutral-800/50 p-4">
                <p className="text-sm text-[#C89B3C] font-semibold">Best for:</p>
                <p className="text-sm text-neutral-400">{mode.bestFor || ''}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">{t('tips') || 'Tip'}</h2>
          <p className="text-lg leading-8 text-neutral-300">{modesData?.tips || 'Choose the mode that fits your style.'}</p>
        </section>
      </div>
    </main>
  )
}
