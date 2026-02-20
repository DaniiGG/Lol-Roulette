// components/SEOContent.tsx
// Agregar al final de tu página principal

export default function SEOContent() {
  return (
    <div className="max-w-4xl mx-auto mt-16 mb-8 px-6">
      {/* Hidden H1 for SEO */}
      <h1 className="sr-only">
        League of Legends Random Champion Generator - Free LoL Roulette
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
          </div>
        </section>

        <section className="pt-6 border-t border-neutral-700">
          <p className="text-sm text-neutral-500">
            <strong>Keywords:</strong> league of legends random champion, lol random champion picker, 
            random lol champion generator, league roulette, lol challenge tracker, league of legends 
            roulette, random champion lol, lol random pick, league challenge, summoner tracker
          </p>
        </section>

      </div>
    </div>
  )
}