import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import { Link } from '@/i18n/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('page-seo')

  return buildPageMetadata({
    locale,
    path: '/popular',
    title: t('popular.title'),
    description: t('popular.description'),
  })
}

export default async function PopularPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('popular')
  const tAll = await getTranslations()

  let popularData: any = {}
  try {
    popularData = tAll.raw('popular') as any
  } catch {
    popularData = {}
  }

  const champions = popularData?.champions || []

  const tierColors: Record<string, string> = {
    S: 'bg-[#C89B3C] text-neutral-950',
    A: 'bg-green-500/20 text-green-400',
    B: 'bg-blue-500/20 text-blue-400',
    C: 'bg-yellow-500/20 text-yellow-400',
    D: 'bg-red-500/20 text-red-400',
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 pt-10 pb-12">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: t('title') },
          ]}
        />

        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">{t('sectionLabel') || 'Popular'}</p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t('title')}</h1>
          <p className="max-w-3xl text-lg leading-8 text-neutral-300">{t('subtitle')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {champions.map((champion: any, i: number) => (
            <div
              key={champion.name || i}
              className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 transition hover:border-[#C89B3C]/40"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{champion.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${tierColors[champion.tier] || 'bg-neutral-800 text-neutral-400'}`}>
                    {champion.tier || '?'}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">{champion.role}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-300">{champion.description || ''}</p>
              </div>
              <Link
                href={{ pathname: '/', query: { champion: champion.name } }}
                className="rounded-xl bg-[#C89B3C] px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
              >
                {t('spinWith') || 'Spin with'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
