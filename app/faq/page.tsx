// app/faq/page.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'FAQ - League Roulette | Random Champion Generator Questions',
  description: 'Frequently asked questions about League Roulette. Learn how the random champion generator works, match verification, XP system, achievements, and more.',
  keywords: ['league roulette faq', 'lol random champion generator questions', 'how does league roulette work', 'random champion picker help', 'lol challenge tracker faq'],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ - League Roulette | Random Champion Generator',
    description: 'Answers to common questions about the free LoL random champion generator, match verification, and progression system.',
    url: '/faq',
    siteName: 'League Roulette',
  },
}

const baseUrl = 'https://lol-roulette-nine.vercel.app'

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

export default function FAQPage() {
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
          Back to Game
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-neutral-400">Find answers to common questions about League Roulette</p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          
          {/* Getting Started */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">Getting Started</h2>
            
            <div className="space-y-4">
              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  What is League Roulette?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  League Roulette is a web-based challenge platform for League of Legends players. It randomly selects champions for you to play, helping you expand your champion pool, improve game knowledge, and have fun with unpredictable matches. The platform tracks your progress, awards XP and achievements, and features global leaderboards.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Is League Roulette free to use?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Yes! League Roulette is completely free to use. All core features including champion selection, automatic verification, XP tracking, achievements, and leaderboards are available to all users at no cost. We support the platform through advertisements.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Do I need to download anything?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  No downloads required! League Roulette runs entirely in your web browser. You only need League of Legends installed on your computer to play the actual matches. Simply visit our website, login with your Riot account, and start spinning.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  How do I create an account?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Click the "Login to Track Progress" button on the homepage and authenticate with your Riot Games account. We use Riot's official OAuth system, so your credentials are secure and never stored on our servers. Once authenticated, your account is automatically created and you can start playing immediately.
                </div>
              </details>
            </div>
          </section>

          {/* Gameplay */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">Gameplay</h2>
            
            <div className="space-y-4">
              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  How does the champion selection work?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  First, select your preferred lane (Top, Jungle, Mid, ADC, Support, or All Lanes). Then click "Pull the Lever" to spin the slot machine roulette. The system randomly selects a champion from your chosen lane pool. Each spin is completely random and fair - no algorithms favor certain champions.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Can I reroll if I don't like the champion?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Yes! You have unlimited spins per challenge. If you don't like your champion, you can keep rerolling until you find one you want to play.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  What game modes count for verification?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  All official League of Legends game modes count: Ranked Solo/Duo, Ranked Flex, Normal Draft, Normal Blind Pick, and ARAM. Both Summoner's Rift and Howling Abyss matches are verified. Custom games and practice tool matches do not count.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Do I need to own the champion?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Yes, you need to own the champion in League of Legends to play them. If you get a champion you don't own, you can use your rerolls to get a different one. Alternatively, champions are available during their free rotation week, so keep an eye on which champions are free each week.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  What happens if I play a different champion than assigned?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  The verification system will detect that you played the wrong champion and the challenge will fail. You won't earn XP, your win streak will reset to 0, and the challenge will be marked as failed. Always make sure to play the champion shown in your active challenge!
                </div>
              </details>
            </div>
          </section>

          {/* Verification */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">Verification & Progress</h2>
            
            <div className="space-y-4">
              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  How does automatic verification work?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Our system checks your match history every 2 minutes using the official Riot Games API. When it detects a new match with your assigned champion, it automatically verifies the result. This usually happens within 5 minutes of your match ending. You don't need to submit screenshots or manually verify anything.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Why didn't my match verify?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Common reasons: 1) You played a different champion than assigned, 2) The match was played before you got the challenge, 3) It was a custom game or practice tool match, 4) There's a delay in Riot's API (wait 10-15 minutes), or 5) Your match history is set to private in League settings. Check that your profile is public and you played the correct champion.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  How much XP do I earn per challenge?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  You earn 100 XP for each successfully completed challenge (playing and winning with your assigned champion). Every 1,000 XP equals one level. So you need 10 successful challenges to level up. Achievements also award bonus XP when unlocked, ranging from 50 to 500 XP depending on the achievement.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  What happens if I lose a match?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  If you play the correct champion but lose the match, your current win streak resets to 0 and you don't earn XP for that challenge. However, you can immediately start a new challenge and try again. Losses are part of the learning process, especially when playing unfamiliar champions!
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  How do win streaks work?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Your current streak increases by 1 for each consecutive victory with random champions. The streak resets to 0 if you lose a match or fail a challenge. Your longest streak is tracked separately and never decreases - it's your best achievement. Both current and longest streaks appear on the leaderboards.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Can I manually verify a match?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Yes! While automatic verification runs every 2 minutes, you can also click the "Verify Match" button to manually trigger verification immediately after your match ends. This is useful if you don't want to wait for the automatic check.
                </div>
              </details>
            </div>
          </section>

          {/* Achievements & Leaderboards */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">Achievements & Leaderboards</h2>
            
            <div className="space-y-4">
              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  What achievements are available?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  League Roulette features multiple achievement categories: First Steps (complete your first challenge), Consistency (reach 10, 50, 100 challenges), Win Streaks (achieve 3, 5, 10 consecutive wins), Leveling (reach levels 5, 10, 25, 50), and Special achievements for unique accomplishments. Check the Achievements page to see them all!
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  How do leaderboards work?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  There are 5 leaderboard categories: Total XP (most experience earned), Highest Level (highest player level), Most Challenges (most completed challenges), Current Streak (longest active win streak), and Best Streak (best win streak of all time). You can switch between categories to see where you rank in each. Leaderboards update in real-time as players complete challenges.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Where do I see my rank?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Visit the Leaderboard page from the main menu. Your position is highlighted in gold if you're in the top 100. If you're ranked lower, your current position is shown in a special card at the top of the leaderboard so you always know where you stand. Your rank is calculated separately for each leaderboard category.
                </div>
              </details>
            </div>
          </section>

          {/* Technical & Account */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">Technical & Account</h2>
            
            <div className="space-y-4">
              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Is my Riot account safe?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Absolutely. We use Riot's official OAuth authentication system, which means your Riot username and password are never shared with or stored on our servers. We only receive a secure token that allows us to read your public match history. We cannot access your account credentials, make purchases, or modify your account in any way.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  What data do you collect?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  We collect only the minimum necessary data: your Riot ID (summoner name and tag), region, match history for verification purposes, and your progress data (XP, level, achievements, win streaks). All data is stored securely and used solely to provide the League Roulette service. For complete details, see our Privacy Policy.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Can I delete my account?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Yes. Contact us through our Contact page with your account details and we'll delete all your data from our systems within 7 days. Note that this will permanently remove your progress, achievements, and leaderboard rankings. This action cannot be undone.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Which regions are supported?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  All League of Legends regions are supported: EUW, EUNE, NA, KR, BR, LAN, LAS, OCE, TR, RU, JP, PH, SG, TH, TW, and VN. The system automatically detects your region when you login and verifies matches from your regional server.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  Does League Roulette work on mobile?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  Yes! The League Roulette website is fully responsive and works on mobile phones and tablets. However, League of Legends itself is only available on PC, so you'll need to play your matches on a computer. You can use mobile to spin the roulette and check your progress, then play the match on your PC.
                </div>
              </details>

              <details className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                  I found a bug. How do I report it?
                  <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 text-neutral-300 leading-relaxed">
                  We appreciate bug reports! Please visit our Contact page and describe the issue in detail: what you were doing when it occurred, what you expected to happen, and what actually happened. Screenshots are helpful. We review all bug reports and work quickly to fix issues.
                </div>
              </details>
            </div>
          </section>

          {/* Still Have Questions */}
          <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border border-[#C89B3C]/50">
            <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
            <p className="text-neutral-300 text-lg mb-6">
              Didn't find what you were looking for? We're here to help!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/contact"
                className="px-8 py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition text-lg"
              >
                Contact Support
              </a>
              <a
                href="/howtoplay"
                className="px-8 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition text-lg"
              >
                Read Tutorial
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}