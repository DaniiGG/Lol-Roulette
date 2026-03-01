// app/about/page.tsx
export default function AboutPage() {
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

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">About League Roulette</h1>
          <p className="text-xl text-neutral-400">Challenging League of Legends players since 2024</p>
        </div>

        {/* Main Content */}
        <div className="prose prose-invert max-w-none">
          
          {/* Mission Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              League Roulette was created to help League of Legends players break out of their comfort zones and become more versatile summoners. We believe that true mastery comes from being able to adapt to any situation, and what better way to practice adaptability than by playing random champions?
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed">
              Our platform combines the excitement of randomness with a structured progression system, making it fun and rewarding to challenge yourself with champions you might never have considered playing before.
            </p>
          </section>

          {/* Story Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-4">The Story Behind League Roulette</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              Every League of Legends player has experienced the frustration of facing the same champions over and over, or falling into the trap of only playing their comfort picks. League Roulette was born from a simple idea: what if we could make learning new champions fun and competitive?
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              The concept started as a friendly challenge among friends, using a basic random number generator to pick champions. The excitement and laughter that came from watching each other struggle (and sometimes surprise everyone) with unfamiliar champions inspired us to create something more substantial.
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed">
              What began as a simple tool has evolved into a full-featured platform with automatic match verification, achievement systems, leaderboards, and a growing community of players who embrace the chaos and challenge of random champion selection.
            </p>
          </section>

          {/* What We Offer Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">What We Offer</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  🎰
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Random Champion Selection</h3>
                  <p className="text-neutral-400">
                    Our sophisticated roulette system randomly selects champions from all 173 League of Legends champions. Filter by lane to focus on your preferred role, or go full random for the ultimate challenge.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Automatic Verification</h3>
                  <p className="text-neutral-400">
                    Using the official Riot Games API, we automatically detect and verify your matches. No manual screenshots or proof needed - just play your game and we'll handle the rest.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  📈
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Progression System</h3>
                  <p className="text-neutral-400">
                    Earn XP and level up by completing challenges. Build win streaks, unlock achievements, and climb the ranks. Every successful challenge brings you closer to mastery.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Competitive Leaderboards</h3>
                  <p className="text-neutral-400">
                    Compete with players worldwide across multiple categories: total XP, win streaks, challenges completed, and more. See how you stack up against the best.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center text-2xl">
                  🎖️
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Achievement System</h3>
                  <p className="text-neutral-400">
                    Unlock special achievements by reaching milestones. From your first victory to incredible win streaks, celebrate your accomplishments and show off your dedication.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Random Champions Section */}
          <section className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-[#C89B3C]/10 to-transparent border border-[#C89B3C]/30">
            <h2 className="text-3xl font-bold text-white mb-4">Why Random Champions?</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              Playing random champions might seem chaotic, but it's one of the best ways to improve as a League of Legends player. Here's why:
            </p>
            
            <ul className="space-y-3 text-neutral-300 text-lg">
              <li className="flex gap-3">
                <span className="text-[#C89B3C] flex-shrink-0">•</span>
                <span><strong className="text-white">Learn Champion Abilities:</strong> Understanding what every champion does makes you a better player, whether you're playing with or against them.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C] flex-shrink-0">•</span>
                <span><strong className="text-white">Improve Fundamentals:</strong> When you can't rely on muscle memory, you focus on core mechanics like positioning, map awareness, and decision-making.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C] flex-shrink-0">•</span>
                <span><strong className="text-white">Break Bad Habits:</strong> Playing new champions forces you to think differently and adapt your playstyle.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C] flex-shrink-0">•</span>
                <span><strong className="text-white">Discover New Favorites:</strong> You might find your new main champion through League Roulette!</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C89B3C] flex-shrink-0">•</span>
                <span><strong className="text-white">Have More Fun:</strong> Predictability gets boring. Random champions keep every game fresh and exciting.</span>
              </li>
            </ul>
          </section>

          {/* Community Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              League Roulette is more than just a tool - it's a community of players who embrace challenge and growth. Whether you're a seasoned veteran or a newer player looking to expand your champion pool, you'll find like-minded summoners here.
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed mb-4">
              Share your epic comeback stories, discuss strategies for difficult champions, and celebrate achievements together. The leaderboards foster healthy competition, while the shared experience of random champion chaos creates lasting connections.
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed">
              We're constantly improving the platform based on community feedback. Have a suggestion? Found a bug? Want to share your experience? We'd love to hear from you on our <a href="/contact" className="text-[#C89B3C] hover:text-[#d9aa44] underline">contact page</a>.
            </p>
          </section>

          {/* Values Section */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">Our Values</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🎯 Fair Play</h3>
                <p className="text-neutral-400">
                  We use official Riot Games APIs to ensure all verification is accurate and fair. No cheating, no shortcuts - just honest gameplay.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🔒 Privacy</h3>
                <p className="text-neutral-400">
                  Your data is protected and never shared. We only access the information necessary to verify matches and track your progress.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🚀 Innovation</h3>
                <p className="text-neutral-400">
                  We're constantly adding new features and improvements. League Roulette evolves with the needs of our community.
                </p>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">League Roulette by the Numbers</h2>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-[#C89B3C] mb-2">173</div>
                <div className="text-neutral-400">Champions Available</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-[#C89B3C] mb-2">5</div>
                <div className="text-neutral-400">Lane Filters</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-[#C89B3C] mb-2">∞</div>
                <div className="text-neutral-400">Possible Combinations</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-[#C89B3C] mb-2">24/7</div>
                <div className="text-neutral-400">Automatic Verification</div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border border-[#C89B3C]/50">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Challenge Yourself?</h2>
            <p className="text-neutral-300 text-lg mb-6">
              Join thousands of players who are expanding their champion pools and having fun doing it.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/"
                className="px-8 py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition text-lg"
              >
                Start Playing Now
              </a>
              <a
                href="/how-to-play"
                className="px-8 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition text-lg"
              >
                Learn How to Play
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}