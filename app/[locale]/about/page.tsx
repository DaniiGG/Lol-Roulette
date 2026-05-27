// app/about/page.tsx
import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'About League Roulette - Free LoL Random Champion Generator',
  description: 'Learn about League Roulette, the free random champion generator for League of Legends. Track wins, earn XP, unlock achievements, and climb the leaderboard.',
  keywords: ['about league roulette', 'lol random champion generator about', 'league of legends challenge platform', 'free lol randomizer tool'],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About League Roulette - Random Champion Challenge Platform',
    description: 'Free random champion generator for League of Legends with match verification, XP tracking, achievements, and leaderboards.',
    url: '/about',
    siteName: 'League Roulette',
  },
}

const baseUrl = 'https://lol-roulette-nine.vercel.app'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'About', item: `${baseUrl}/about` },
  ],
}

export default async function AboutPage() {
  const t = await getTranslations('about')

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
        <div className="prose prose-invert max-w-none">
          
          {/* Mission Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-4">{t('missionTitle')}</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('missionP1')}
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed">
              {t('missionP2')}
            </p>
          </section>

          {/* Story Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-4">{t('storyTitle')}</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('storyP1')}
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('storyP2')}
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed">
              {t('storyP3')}
            </p>
          </section>

          {/* What We Offer Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">{t('offerTitle')}</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  🎰
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('offerRandom')}</h3>
                  <p className="text-neutral-400">
                    {t('offerRandomDesc')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('offerVerify')}</h3>
                  <p className="text-neutral-400">
                    {t('offerVerifyDesc')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  📈
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('offerXp')}</h3>
                  <p className="text-neutral-400">
                    {t('offerXpDesc')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('offerLeaderboard')}</h3>
                  <p className="text-neutral-400">
                    {t('offerLeaderboardDesc')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  🎖️
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('offerStreaks')}</h3>
                  <p className="text-neutral-400">
                    {t('offerStreaksDesc')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Random Champions Section */}
          <section className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-[#C89B3C]/10 to-transparent border border-[#C89B3C]/30">
            <h2 className="text-3xl font-bold text-white mb-4">{t('whyTitle')}</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('whyP1')}
            </p>
            
            <ul className="space-y-3 text-neutral-300 text-lg">
              {(t.raw('whyBullets') as string[]).map((bullet: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#C89B3C] flex-shrink-0">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Community Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-4">{t('communityTitle')}</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('communityP1')}
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('communityP2')}
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed">
              {t.rich('communityP3', { contactLink: (chunks) => <a href="/contact" className="text-[#C89B3C] hover:text-[#d9aa44] underline">{chunks}</a> })}
            </p>
          </section>

          {/* Values Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">{t('valuesTitle')}</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🎯 {t('valueFairPlay')}</h3>
                <p className="text-neutral-400">
                  {t('valueFairPlayDesc')}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🔒 {t('valuePrivacy')}</h3>
                <p className="text-neutral-400">
                  {t('valuePrivacyDesc')}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🚀 {t('valueInnovation')}</h3>
                <p className="text-neutral-400">
                  {t('valueInnovationDesc')}
                </p>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">{t('numbersTitle')}</h2>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-[#C89B3C] mb-2">173</div>
                <div className="text-neutral-400">{t('numbersChampions')}</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-[#C89B3C] mb-2">5</div>
                <div className="text-neutral-400">{t('numbersChallenges')}</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-[#C89B3C] mb-2">∞</div>
                <div className="text-neutral-400">{t('numbersAchievements')}</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-[#C89B3C] mb-2">24/7</div>
                <div className="text-neutral-400">{t('numbersPlayers')}</div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border border-[#C89B3C]/50">
            <h2 className="text-3xl font-bold text-white mb-4">{t('ctaTitle')}</h2>
            <p className="text-neutral-300 text-lg mb-6">
              {t('communityP1')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/"
                className="px-8 py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition text-lg"
              >
                {t('ctaStart')}
              </a>
              <a
                href="/howtoplay"
                className="px-8 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition text-lg"
              >
                {t('ctaLearn')}
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}