// app/how-to-play/page.tsx
import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'How to Play League Roulette - Complete Guide & Tutorial',
  description: 'Learn how to use the League Roulette random champion generator. Step-by-step guide covering account setup, lane selection, spinning, match verification, and rewards.',
  keywords: ['how to play league roulette', 'lol random champion generator tutorial', 'league roulette guide', 'how to use lol champion picker', 'league of legends challenge platform tutorial'],
  alternates: {
    canonical: '/howtoplay',
  },
  openGraph: {
    title: 'How to Play League Roulette - Complete Guide',
    description: 'Step-by-step tutorial for the free LoL random champion generator. Learn to spin, verify matches, earn XP, and climb leaderboards.',
    url: '/howtoplay',
    siteName: 'League Roulette',
  },
}

const baseUrl = 'https://lol-roulette-nine.vercel.app'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'How to Play', item: `${baseUrl}/howtoplay` },
  ],
}

export default async function HowToPlayPage() {
  const t = await getTranslations('howToPlay')

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
          
          {/* Introduction */}
          <section className="p-8 rounded-2xl bg-gradient-to-br from-[#C89B3C]/10 to-transparent border border-[#C89B3C]/30">
            <h2 className="text-3xl font-bold text-white mb-4">{t('whatIsTitle')}</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              League Roulette is a challenge platform for League of Legends players that randomly selects champions for you to play. It's designed to help you break out of your comfort zone, learn new champions, and improve your overall game knowledge while having fun and earning rewards.
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed">
              Whether you're a one-trick pony looking to expand your champion pool, or a veteran player seeking a new challenge, League Roulette adds excitement and unpredictability to your League of Legends experience.
            </p>
          </section>

          {/* Step 1: Registration */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C] flex items-center justify-center text-neutral-950 font-bold text-xl">
                1
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{t('steps.account.title')}</h2>
              </div>
            </div>
            
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('steps.account.desc')}
            </p>
            
            <ul className="space-y-2 text-neutral-300 text-lg mb-4 ml-6">
              <li className="flex gap-3">
                <span className="text-[#C89B3C]">•</span>
                <span>Automatically verify your match results without manual screenshots</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C]">•</span>
                <span>Track your progress, XP, and level across sessions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C]">•</span>
                <span>Award you achievements based on your accomplishments</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C]">•</span>
                <span>Display you on the global leaderboard</span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className="text-blue-300 text-sm">
                <strong>Privacy Note:</strong> We only access public match data through the official Riot Games API. Your account credentials are never stored on our servers, and we never share your personal information.
              </p>
            </div>
          </section>

          {/* Step 2: Lane Selection */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C] flex items-center justify-center text-neutral-950 font-bold text-xl">
                2
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{t('steps.lane.title')}</h2>
              </div>
            </div>
            
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('steps.lane.desc')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">⚔️ Top Lane</h3>
                <p className="text-neutral-400">Bruisers, tanks, and split-pushers. Perfect for players who like 1v1 duels and solo carrying.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">🌲 Jungle</h3>
                <p className="text-neutral-400">Junglers who control the map through ganks and objective control.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">⚡ Mid Lane</h3>
                <p className="text-neutral-400">Mages, assassins, and control mages. The most diverse role in the game.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">🏹 ADC (Bot)</h3>
                <p className="text-neutral-400">Marksmen and bot laners who scale into late-game powerhouses.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">🛡️ Support</h3>
                <p className="text-neutral-400">Enchanters, tanks, and mages who enable their team to succeed.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">🎲 All Lanes</h3>
                <p className="text-neutral-400">True chaos mode - any champion from any role. Maximum challenge!</p>
              </div>
            </div>

            <p className="text-neutral-300 text-lg leading-relaxed">
              You can change your lane selection at any time before spinning. Choose "All Lanes" if you're feeling adventurous and want the ultimate random experience!
            </p>
          </section>

          {/* Step 3: Spin the Roulette */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C] flex items-center justify-center text-neutral-950 font-bold text-xl">
                3
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{t('steps.spin.title')}</h2>
              </div>
            </div>
            
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('steps.spin.desc')}
            </p>
            
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              <strong className="text-white">Rerolls:</strong> Don't like what you got? You have unlimited spins! Use them to find your perfect match.
            </p>
            
            <ul className="space-y-2 text-neutral-300 text-lg mb-4 ml-6">
              <li className="flex gap-3">
                <span className="text-[#C89B3C]">•</span>
                <span><strong className="text-white">Spin 1:</strong> Your first random champion</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C]">•</span>
                <span><strong className="text-white">Spin 2:</strong> Changed your mind? Reroll for a different champion</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C]">•</span>
                <span><strong className="text-white">Spin 3:</strong> Last chance to get a champion you're comfortable with</span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <p className="text-orange-300 text-sm">
                <strong>Important:</strong> Actually, you can reroll <strong>as many times as you like</strong> until you find a champion you want to play!
              </p>
            </div>
          </section>

          {/* Step 4: Play Your Match */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C] flex items-center justify-center text-neutral-950 font-bold text-xl">
                4
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{t('steps.play.title')}</h2>
              </div>
            </div>
            
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('steps.play.desc')}
            </p>
            
            <div className="space-y-4 mb-4">
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">📚 Quick Research</h3>
                <p className="text-neutral-400">
                  Take 2-3 minutes to review the champion's abilities on the loading screen or during champion select. Understanding your kit is crucial for success.
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">🎯 Focus on Fundamentals</h3>
                <p className="text-neutral-400">
                  When playing an unfamiliar champion, focus on good positioning, map awareness, and decision-making rather than flashy mechanics.
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">💬 Communicate</h3>
                <p className="text-neutral-400">
                  Let your team know you're trying a new champion. Most players are understanding and might even give you tips!
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-2">🎮 Have Fun</h3>
                <p className="text-neutral-400">
                  Remember, the point is to learn and have fun. Don't stress too much about winning - enjoy the challenge!
                </p>
              </div>
            </div>

            <p className="text-neutral-300 text-lg leading-relaxed">
              Play your match normally. You can play any game mode - Summoner's Rift ranked, normal draft, ARAM, or any other mode. Our system will automatically detect when your match ends.
            </p>
          </section>

          {/* Step 5: Automatic Verification */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C] flex items-center justify-center text-neutral-950 font-bold text-xl">
                5
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{t('steps.verify.title')}</h2>
              </div>
            </div>
            
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('steps.verify.desc')}
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-green-400">Victory!</strong>
                  <p className="text-neutral-300 mt-1">You played the correct champion and won. You earn 100 XP, your win streak increases, and you get closer to unlocking achievements.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <svg className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <strong className="text-orange-400">Defeat</strong>
                  <p className="text-neutral-300 mt-1">You played the correct champion but lost. Your win streak resets to 0, but you can try again immediately!</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-red-400">Wrong Champion</strong>
                  <p className="text-neutral-300 mt-1">The system detected you played a different champion than assigned. No XP awarded, and win streak resets. Make sure to play the correct champion!</p>
                </div>
              </div>
            </div>

            <p className="text-neutral-300 text-lg leading-relaxed">
              The verification process is completely automatic and usually completes within 2-5 minutes after your match ends. You don't need to do anything - just wait for the notification!
            </p>
          </section>

          {/* Step 6: Progress & Rewards */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C] flex items-center justify-center text-neutral-950 font-bold text-xl">
                6
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{t('steps.progress.title')}</h2>
              </div>
            </div>
            
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              {t('steps.progress.desc')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">⭐ Experience Points</h3>
                <p className="text-neutral-400">
                  Earn 100 XP per completed challenge. Every 1,000 XP = 1 level. Leveling up shows your dedication and skill.
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🔥 Win Streaks</h3>
                <p className="text-neutral-400">
                  Build consecutive wins to climb the Current Streak leaderboard. Can you reach a 10-win streak with random champions?
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🏆 Achievements</h3>
                <p className="text-neutral-400">
                  Unlock special achievements by reaching milestones: First Win, 10 Challenges, 5-Win Streak, and many more!
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">📊 Leaderboards</h3>
                <p className="text-neutral-400">
                  Compete globally across 5 categories: Total XP, Level, Challenges Completed, Current Streak, and Best Streak.
                </p>
              </div>
            </div>
          </section>

          {/* Tips & Best Practices */}
          <section className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-6">Tips for Success</h2>
            
            <ul className="space-y-4 text-neutral-300 text-lg">
              <li className="flex gap-3">
                <span className="text-[#C89B3C] text-2xl flex-shrink-0">1.</span>
                <span><strong className="text-white">Start with your comfort role:</strong> Begin by filtering for your main role to build confidence before trying "All Lanes" mode.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C] text-2xl flex-shrink-0">2.</span>
                <span><strong className="text-white">Learn one ability at a time:</strong> Focus on understanding the champion's Q ability first, then W, E, and R as the game progresses.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C] text-2xl flex-shrink-0">3.</span>
                <span><strong className="text-white">Play safe early:</strong> Don't try to make flashy plays with unfamiliar champions. Farm safely and learn the champion's limits.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C] text-2xl flex-shrink-0">4.</span>
                <span><strong className="text-white">Use recommended builds:</strong> Stick to recommended items and runes until you understand the champion better.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C] text-2xl flex-shrink-0">5.</span>
                <span><strong className="text-white">Stay positive:</strong> Remember, you're learning! Even losses are valuable experience that make you a better player.</span>
              </li>
            </ul>
          </section>

          {/* Call to Action */}
          <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border border-[#C89B3C]/50">
            <h2 className="text-3xl font-bold text-white mb-4">{t('ctaTitle')}</h2>
            <p className="text-neutral-300 text-lg mb-6">
              You now know everything you need to begin your League Roulette adventure. Time to spin the wheel and embrace the challenge!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/"
                className="px-8 py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition text-lg"
              >
                {t('ctaPlay')}
              </a>
              <a
                href="/faq"
                className="px-8 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition text-lg"
              >
                {t('ctaFaq')}
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}