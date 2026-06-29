// app/faq/page.tsx
import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'FAQ - League Roulette | Random LoL Champion Generator & Champion Roulette Questions',
    description: 'Everything you need to know about the random lol champion generator, League of Legends roulette, and champion roulette. How the LoL random picker and league of legends randomizer work, match verification, win tracking, and more.',
    keywords: ['champion roulette faq', 'random lol champion faq', 'league roulette faq', 'lol random champion generator questions', 'how does league roulette work', 'random champion picker help', 'champion roulette league of legends', 'win 2 spin lol', 'league of legends randomizer faq', 'random league champ generator help'],
    alternates: {
      canonical: locale === 'en' ? '/faq' : `/${locale}/faq`,
      languages: getHreflangAlternates('/faq'),
    },
    openGraph: {
      title: 'FAQ - League Roulette | Random Champion Generator',
      description: 'Answers to common questions about the free LoL random champion generator, match verification, and progression system.',
      url: locale === 'en' ? '/faq' : `/${locale}/faq`,
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
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${baseUrl}/faq` },
  ],
}

const faqData = [
  { question: 'What is League Roulette?', answer: 'League Roulette is a web-based challenge platform for League of Legends players. It randomly selects champions for you to play, helping you expand your champion pool, improve game knowledge, and have fun with unpredictable matches. The platform tracks your progress, awards XP and achievements, and features global leaderboards.' },
  { question: 'Is League Roulette free to use?', answer: 'Yes! League Roulette is completely free to use. All core features including champion selection, automatic verification, XP tracking, achievements, and leaderboards are available to all users at no cost. We support the platform through advertisements.' },
  { question: 'Do I need to download anything?', answer: 'No downloads required! League Roulette runs entirely in your web browser. You only need League of Legends installed on your computer to play the actual matches. Simply visit our website, login with your Riot account, and start spinning.' },
  { question: 'How do I create an account?', answer: 'Click the "Login to Track Progress" button on the homepage and authenticate with your Riot Games account. We use Riot\'s official OAuth system, so your credentials are secure and never stored on our servers. Once authenticated, your account is automatically created and you can start playing immediately.' },
  { question: 'How does the champion selection work?', answer: 'First, select your preferred lane (Top, Jungle, Mid, ADC, Support, or All Lanes). Then click "Pull the Lever" to spin the slot machine roulette. The system randomly selects a champion from your chosen lane pool. Each spin is completely random and fair.' },
  { question: 'Can I reroll if I don\'t like the champion?', answer: 'Yes! You have unlimited spins per challenge. If you don\'t like your champion, you can keep rerolling until you find one you want to play.' },
  { question: 'What game modes count for verification?', answer: 'All official League of Legends game modes count: Ranked Solo/Duo, Ranked Flex, Normal Draft, Normal Blind Pick, and ARAM. Both Summoner\'s Rift and Howling Abyss matches are verified. Custom games and practice tool matches do not count.' },
  { question: 'How does automatic verification work?', answer: 'Our system checks your match history every 2 minutes using the official Riot Games API. When it detects a new match with your assigned champion, it automatically verifies the result. This usually happens within 5 minutes of your match ending.' },
  { question: 'How much XP do I earn per challenge?', answer: 'You earn 100 XP for each successfully completed challenge. Every 1,000 XP equals one level. So you need 10 successful challenges to level up. Achievements also award bonus XP when unlocked.' },
  { question: 'What achievements are available?', answer: 'League Roulette features multiple achievement categories: First Steps (complete your first challenge), Consistency (reach 10, 50, 100 challenges), Win Streaks (achieve 3, 5, 10 consecutive wins), Leveling (reach levels 5, 10, 25, 50), and Special achievements for unique accomplishments.' },
  { question: 'How do leaderboards work?', answer: 'There are 5 leaderboard categories: Total XP, Highest Level, Most Challenges, Current Streak, and Best Streak. You can switch between categories to see where you rank. Leaderboards update in real-time as players complete challenges.' },
  { question: 'Is my Riot account safe?', answer: 'Absolutely. We use Riot\'s official OAuth authentication system. Your Riot username and password are never shared with or stored on our servers. We only receive a secure token that allows us to read your public match history.' },
  { question: 'Which regions are supported?', answer: 'All League of Legends regions are supported: EUW, EUNE, NA, KR, BR, LAN, LAS, OCE, TR, RU, JP, PH, SG, TH, TW, and VN.' },
  { question: 'Does League Roulette work on mobile?', answer: 'Yes! The website is fully responsive and works on mobile phones and tablets. You can use mobile to spin the roulette and check your progress, then play the match on your PC.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default async function FAQPage() {
  const t = await getTranslations('faq')
  const tAll = await getTranslations()
  const faqContent = tAll.raw('faqContent') as { q: string; a: string }[]

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-neutral-400">{t('subtitle')}</p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          
          {/* Getting Started (0-3) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionGettingStarted')}</h2>
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Gameplay (4-6) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionGameplay')}</h2>
            <div className="space-y-4">
              {[4, 5, 6].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Verification & Progress (7-9) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionVerification')}</h2>
            <div className="space-y-4">
              {[7, 8, 9].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Achievements & Leaderboards (10-11) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionAchievements')}</h2>
            <div className="space-y-4">
              {[10, 11].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Technical & Account (12-13) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionTechnical')}</h2>
            <div className="space-y-4">
              {[12, 13].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Still Have Questions */}
          <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border border-[#C89B3C]/50">
            <h2 className="text-3xl font-bold text-white mb-4">{t('stillQuestions')}</h2>
            <p className="text-neutral-300 text-lg mb-6">
              {t('stillQuestionsDesc')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/contact"
                className="px-8 py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition text-lg"
              >
                {t('contactSupport')}
              </a>
              <a
                href="/howtoplay"
                className="px-8 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition text-lg"
              >
                {t('readTutorial')}
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}