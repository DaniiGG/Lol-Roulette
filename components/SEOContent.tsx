// components/SEOContent.tsx
// Agregar al final de tu página principal

export default function SEOContent() {
  return (
    <div className="max-w-4xl mx-auto mt-16 mb-8 px-6">
      {/* Hidden H1 for SEO */}
      <h1 className="sr-only">
        Free Random League of Legends Champion Generator | LoL Roulette & Picker 2026 - Ranked, ARAM, Custom
      </h1>
      
      {/* SEO Content Section */}
      <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-8 space-y-6 text-neutral-300">
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            What is League Roulette?
          </h2>
          <p className="leading-relaxed">
            League Roulette is a <strong>free random champion generator</strong> for League of Legends(Lol). 
            Spin the wheel to get a random LoL champion and challenge yourself to win ranked or normal 
            games. Track your progress, earn XP, unlock achievements, and compete on the global leaderboard!
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            How to Use the Random Champion Picker
          </h2>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Select your preferred lane (Top, Jungle, Mid, ADC, or Support)</li>
            <li>Click "Spin Roulette" to get a random League of Legends champion</li>
            <li>Play a match with that champion in League of Legends</li>
            <li>Login to verify your win and earn XP and achievements</li>
            <li>Build your streak and climb the leaderboard!</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Features
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li>✅ Random champion generator for all lanes</li>
            <li>✅ Match verification with Riot API</li>
            <li>✅ XP and leveling system</li>
            <li>✅ 15+ unlockable achievements</li>
            <li>✅ Win streak tracking</li>
            <li>✅ Global leaderboard</li>
            <li>✅ 100% free to use</li>
            <li>✅ Mobile-friendly interface</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Why Use a Random Champion Generator?
          </h2>
          <p className="leading-relaxed">
            Using a random LoL champion picker helps you:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Discover new champions and playstyles</li>
            <li>Break out of your comfort zone</li>
            <li>Improve your overall game knowledge</li>
            <li>Make League of Legends fun again</li>
            <li>Create entertaining content for streaming</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Perfect for ARAM, Ranked & Custom Games
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">ARAM Chaos</h3>
              <p className="text-neutral-300">Random ARAM champion generator gives you unexpected team comps. Try support mains in ADC or assassins in botlane!</p>
            </div>
            <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">Ranked Challenges</h3>
              <p className="text-neutral-300">LoL random champion picker ranked edition. Off-meta picks to climb out of rut. Track winrate improvement!</p>
            </div>
            <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">Custom Games</h3>
              <p className="text-neutral-300">League champion roulette with friends. Random champion wheel for tournaments, 1v1s, or fun custom modes.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Random Challenge Ideas
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <h3 className="font-semibold text-white mb-2">Solo Queue Dare</h3>
              <p className="text-neutral-300 text-sm">Play 3 games in a row with random picks. No bans on your champion!</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
              <h3 className="font-semibold text-white mb-2">Off-Meta Week</h3>
              <p className="text-neutral-300 text-sm">Only play champions you have 10 games on. Expand champion pool!</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <h3 className="font-semibold text-white mb-2">Streak Master</h3>
              <p className="text-neutral-300 text-sm">Keep winning with random picks until you lose. Beat your record!</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30">
              <h3 className="font-semibold text-white mb-2">Friends Roulette</h3>
              <p className="text-neutral-300 text-sm">Everyone spins together. No dodging allowed!</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">
                Is League Roulette free?
              </h3>
              <p>
                Yes! League Roulette is completely free to use. You can spin the roulette 
                without creating an account, or login to track your progress and compete.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                How does match verification work?
              </h3>
              <p>
                We use Riot Games' official API to verify that you played and won with 
                the assigned champion. Your match data is fetched securely and privately.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Can I filter champions by lane?
              </h3>
              <p>
                Yes! You can select your preferred lane (Top, Jungle, Mid, ADC, Support) 
                and get a random champion that fits that role.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Is this affiliated with Riot Games?
              </h3>
              <p>
                No. League Roulette is an independent fan-made project and is not 
                endorsed by Riot Games.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Does it include all 169+ Season 2026 champions?
              </h3>
              <p>
                Yes! Updated for Season 2026 with all League of Legends champions including new releases.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Is it good for ARAM random champion generator?
              </h3>
              <p>
                Perfect for ARAM! Filter by role and get random picks that work great in Howling Abyss chaos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Can I use random champion picker for ranked?
              </h3>
              <p>
                Absolutely! Many players use it to practice off-meta picks and improve their champion pool for ranked climb.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Is League Roulette mobile optimized?
              </h3>
              <p>
                100% mobile-friendly. Spin the roulette on phone, tablet, or desktop. Perfect for queue times!
              </p>
            </div>
          </div>
        </section>

        <section className="pt-6 border-t border-neutral-700">
          <p className="text-sm text-neutral-500">
            <strong>Keywords:</strong> league of legends random champion generator, lol random champion picker, random aram champion generator, 
            league roulette, lol champion roulette, random champion lol ranked, league of legends champion wheel, 
            lol randomizer, free lol random champion generator 2026, league challenge tracker
          </p>
        </section>

      </div>
    </div>
  )
}