// components/InfoModal.tsx
'use client'

import { Info, Zap, Trophy, Target, HelpCircle, X } from 'lucide-react'

interface InfoModalProps {
  onClose: () => void
}

export default function InfoModal({ onClose }: InfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-neutral-300">

          {/* Step 1 */}
          <div className="p-5 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Spin the Roulette</h3>
                <p className="text-sm leading-relaxed">
                  Select your preferred lane (Top, Jungle, Mid, ADC, Support) or choose "All" for any role.
                  Click "Spin Roulette" to get a random champion assigned to you.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold text-white">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Play League of Legends</h3>
                <p className="text-sm leading-relaxed mb-3">
                  Open League of Legends and play a match (Ranked or Normal) with the champion you got.
                  Try your best to win!
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-400 text-xs">
                    <strong>Pro tip:</strong> You can play without logging in, but you won't be able to track your progress.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-white">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Login & Verify (Optional)</h3>
                <p className="text-sm leading-relaxed mb-3">
                  After playing, login with your Riot ID and click "Verify Match" to confirm you played
                  with the assigned champion.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>If you won: +100 XP, build your streak, unlock achievements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">✗</span>
                    <span>If you lost: Streak resets, but you can try again!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Progress & Compete</h3>
                <p className="text-sm leading-relaxed">
                  Level up by earning XP, unlock 15+ achievements, build win streaks, and compete
                  on the global leaderboard!
                </p>
              </div>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/howtoplay" className="text-xl font-bold hover:text-white transition">
                More info +
              </a>
            </li>
          </ul>

          {/* Features */}
          <div className="pt-4 border-t border-neutral-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Features
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <span>Random champion generator</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Match verification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>
                <span>XP & leveling system</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-purple-400" />
                </div>
                <span>15+ achievements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <span>Win streak tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span>Global leaderboard</span>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="pt-4 border-t border-neutral-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              FAQ
            </h3>
            <div className="space-y-3 text-sm">
              <details className="group">
                <summary className="cursor-pointer font-semibold text-white hover:text-blue-400 transition">
                  Is this free?
                </summary>
                <p className="mt-2 ml-4 text-neutral-400">
                  Yes! League Roulette is 100% free to use. No premium features, no paywalls.
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-semibold text-white hover:text-blue-400 transition">
                  Do I need to login?
                </summary>
                <p className="mt-2 ml-4 text-neutral-400">
                  No, you can spin the roulette without logging in. But to track wins, earn XP,
                  and unlock achievements, you need to login with your Riot account.
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-semibold text-white hover:text-blue-400 transition">
                  Is my password safe?
                </summary>
                <p className="mt-2 ml-4 text-neutral-400">
                  We never ask for your password. We verify your account using Riot's official API
                  with your Riot ID (GameName#TAG).
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-semibold text-white hover:text-blue-400 transition">
                  What modes count?
                </summary>
                <p className="mt-2 ml-4 text-neutral-400">
                  Both Ranked and Normal games count. ARAM, TFT, and custom games do not count.
                </p>
              </details>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-700">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition"
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>
  )


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-white">ℹ️ How It Works</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-neutral-300">

          {/* Step 1 */}
          <div className="p-5 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Spin the Roulette</h3>
                <p className="text-sm leading-relaxed">
                  Select your preferred lane (Top, Jungle, Mid, ADC, Support) or choose "All" for any role.
                  Click "Spin Roulette" to get a random champion assigned to you.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold text-white">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Play League of Legends</h3>
                <p className="text-sm leading-relaxed mb-3">
                  Open League of Legends and play a match (Ranked or Normal) with the champion you got.
                  Try your best to win!
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-xs">
                    💡 <strong>Pro tip:</strong> You can play without logging in, but you won't be able to track your progress.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-white">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Login & Verify (Optional)</h3>
                <p className="text-sm leading-relaxed mb-3">
                  After playing, login with your Riot ID and click "Verify Match" to confirm you played
                  with the assigned champion.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>If you won: +100 XP, build your streak, unlock achievements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">✗</span>
                    <span>If you lost: Streak resets, but you can try again!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Progress & Compete</h3>
                <p className="text-sm leading-relaxed">
                  Level up by earning XP, unlock 15+ achievements, build win streaks, and compete
                  on the global leaderboard!
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="pt-4 border-t border-neutral-700">
            <h3 className="text-xl font-bold text-white mb-4">✨ Features</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">🎲</span>
                <span>Random champion generator</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span>Match verification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span>XP & leveling system</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">🏆</span>
                <span>15+ achievements</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">🔥</span>
                <span>Win streak tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-pink-400">📊</span>
                <span>Global leaderboard</span>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="pt-4 border-t border-neutral-700">
            <h3 className="text-xl font-bold text-white mb-4">❓ FAQ</h3>
            <div className="space-y-3 text-sm">
              <details className="group">
                <summary className="cursor-pointer font-semibold text-white hover:text-blue-400 transition">
                  Is this free?
                </summary>
                <p className="mt-2 ml-4 text-neutral-400">
                  Yes! League Roulette is 100% free to use. No premium features, no paywalls.
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-semibold text-white hover:text-blue-400 transition">
                  Do I need to login?
                </summary>
                <p className="mt-2 ml-4 text-neutral-400">
                  No, you can spin the roulette without logging in. But to track wins, earn XP,
                  and unlock achievements, you need to login with your Riot account.
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-semibold text-white hover:text-blue-400 transition">
                  Is my password safe?
                </summary>
                <p className="mt-2 ml-4 text-neutral-400">
                  We never ask for your password. We verify your account using Riot's official API
                  with your Riot ID (GameName#TAG).
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-semibold text-white hover:text-blue-400 transition">
                  What modes count?
                </summary>
                <p className="mt-2 ml-4 text-neutral-400">
                  Both Ranked and Normal games count. ARAM, TFT, and custom games do not count.
                </p>
              </details>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-700">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition"
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>
  )
}