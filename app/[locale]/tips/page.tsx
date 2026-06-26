// app/tips/page.tsx
import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Roulette LoL Tips - Master Random Champion Picks & Strategy',
    description: 'Win more with random lol champion picks. Champion roulette tips for every lane, champion archetypes, and mental game advice to master any LoL champion.',
    keywords: ['roulette lol tips', 'random lol champion guide', 'lol strategy tips', 'league of legends champion guides', 'random champion tips', 'how to play any champion lol', 'league of legends fundamentals', 'champion roulette tips'],
    alternates: {
      canonical: locale === 'en' ? '/tips' : `/${locale}/tips`,
      languages: getHreflangAlternates('/tips'),
    },
    openGraph: {
      title: 'LoL Strategy Tips & Champion Guides',
      description: 'Learn to master random champions in League of Legends. Tips for all lanes, champion archetypes, and mental game strategies.',
      url: locale === 'en' ? '/tips' : `/${locale}/tips`,
      siteName: 'League Roulette',
    },
  }
}

const baseUrl = 'https://leagueroulette.com'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Strategy Tips', item: `${baseUrl}/tips` },
  ],
}

export default async function TipsPage() {
  const t = await getTranslations('tips')
  const tAll = await getTranslations()
  const c = tAll.raw('tipsContent') as Record<string, string>

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <a 
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToGame')}
        </a>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-neutral-400">{t('subtitle')}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">

          <section className="p-8 rounded-2xl bg-gradient-to-br from-[#C89B3C]/10 to-transparent border border-[#C89B3C]/30">
            <p className="text-neutral-300 text-lg leading-relaxed">{c['intro']}</p>
          </section>

          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">{c['generalTitle']}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">🎯 {c['g1Title']}</h3>
                <p className="text-neutral-300 leading-relaxed mb-2">{c['g1Text']}</p>
                <ul className="space-y-2 text-neutral-300 ml-6">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#C89B3C]">•</span>
                      <span dangerouslySetInnerHTML={{ __html: c[`g1Bullet${i}`] }} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">📖 {c['g2Title']}</h3>
                <p className="text-neutral-300 leading-relaxed">{c['g2Text']}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">🛡️ {c['g3Title']}</h3>
                <p className="text-neutral-300 leading-relaxed">{c['g3Text']}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">💭 {c['g4Title']}</h3>
                <p className="text-neutral-300 leading-relaxed">{c['g4Text']}</p>
              </div>
            </div>
          </section>

          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">{c['laneTitle']}</h2>
            <div className="space-y-6">
              {[
                { key: 'top', emoji: '⚔️' },
                { key: 'jng', emoji: '🌲' },
                { key: 'mid', emoji: '⚡' },
                { key: 'adc', emoji: '🏹' },
                { key: 'sup', emoji: '🛡️' },
              ].map(({ key, emoji }) => (
                <div key={key} className="p-6 rounded-xl bg-neutral-800 border border-neutral-700">
                  <h3 className="text-2xl font-semibold text-white mb-4">{emoji} {c[`${key}Title`]}</h3>
                  <p className="text-neutral-300 leading-relaxed mb-3">{c[`${key}Text`]}</p>
                  <ul className="space-y-2 text-neutral-300">
                    {[1, 2, 3, 4].map((i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#C89B3C]">•</span>
                        <span dangerouslySetInnerHTML={{ __html: c[`${key}${i}`] }} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">{c['archTitle']}</h2>
            <p className="text-neutral-300 leading-relaxed mb-6">{c['archText']}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                  <h3 className="text-lg font-semibold text-white mb-2">{c[`arch${i}`]}</h3>
                  <p className="text-neutral-400 text-sm">{c[`arch${i}Desc`]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-6">{c['mentalTitle']}</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <h3 className="text-xl font-semibold text-white mb-2">{c[`m${i}Title`]}</h3>
                  <p className="text-neutral-300 leading-relaxed">{c[`m${i}Text`]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">{c['advTitle']}</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">{c[`a${i}Title`]}</h3>
                  <p className="text-neutral-300 leading-relaxed">{c[`a${i}Text`]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border border-[#C89B3C]/50">
            <h2 className="text-3xl font-bold text-white mb-4">{t('ctaTitle')}</h2>
            <p className="text-neutral-300 text-lg mb-6">{c['finalText']}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/" className="px-8 py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition text-lg">{t('ctaPlay')}</a>
              <a href="/howtoplay" className="px-8 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition text-lg">{t('ctaBasics')}</a>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}