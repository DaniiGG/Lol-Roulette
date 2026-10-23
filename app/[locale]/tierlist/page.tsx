import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import Breadcrumbs from '@/components/Breadcrumbs'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('tierlist')
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: locale === 'en' ? '/tierlist' : `/${locale}/tierlist`,
      languages: getHreflangAlternates('/tierlist'),
    },
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: locale === 'en' ? '/tierlist' : `/${locale}/tierlist`,
      siteName: 'League Roulette',
    },
  }
}

export default async function TierListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('tierlist')
  const tAll = await getTranslations()

  let tierData: any = {}
  try {
    tierData = tAll.raw('tierlist') as any
  } catch {
    tierData = {}
  }

  const tiers = tierData?.tiers || {}
  const roles = tierData?.roles || {}
  const updated = tierData?.updated || 'Updated weekly'

  const tierColors: Record<string, string> = {
    S: 'bg-[#C89B3C] text-neutral-950',
    A: 'bg-green-500/20 text-green-400',
    B: 'bg-blue-500/20 text-blue-400',
    C: 'bg-yellow-500/20 text-yellow-400',
    D: 'bg-red-500/20 text-red-400',
  }

  const tierLabels: Record<string, string> = {
    S: t('tiers.S') || 'S - Must Pick',
    A: t('tiers.A') || 'A - Strong Pick',
    B: t('tiers.B') || 'B - Viable Pick',
    C: t('tiers.C') || 'C - Situational Pick',
    D: t('tiers.D') || 'D - Avoid',
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
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">Tier List</p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t('title')}</h1>
          <p className="max-w-3xl text-lg leading-8 text-neutral-300">{t('subtitle')}</p>
          <p className="mt-2 text-sm text-neutral-500">{updated}</p>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">{t('tiers') || 'Tier Legend'}</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(tierLabels).map(([tier, label]) => (
              <span
                key={tier}
                className={`rounded-full px-4 py-1 text-sm font-semibold ${tierColors[tier] || 'bg-neutral-800 text-neutral-400'}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(roles).map(([roleKey, roleData]: [string, any]) => (
            <section key={roleKey} className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
              <h2 className="mb-6 text-2xl font-semibold text-white">{roleData.title || roleKey}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {roleData.champions.map((champion: any, i: number) => (
                  <div
                    key={champion.name || i}
                    className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
                  >
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${tierColors[champion.tier] || 'bg-neutral-800 text-neutral-400'}`}>
                      {champion.tier || '?'}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{champion.name}</h3>
                      <p className="text-sm text-neutral-400">{champion.description || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
