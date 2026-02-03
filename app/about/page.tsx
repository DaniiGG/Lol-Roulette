// app/about/page.tsx
import { Target, Sparkles, Shield, Users, Phone, ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="mb-12">
          <a href="/" className="text-neutral-400 hover:text-white transition text-sm mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
          <h1 className="text-5xl font-bold mb-4">About League Roulette</h1>
          <p className="text-xl text-neutral-400">
            Your random champion challenge companion
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-neutral-300 leading-relaxed">
          
          <section>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              Our Mission
            </h2>
            <p>
              League Roulette was created to help League of Legends players rediscover the fun 
              of the game by challenging them to play with random champions. We believe that 
              stepping out of your comfort zone and trying new champions is the best way to 
              improve as a player and keep the game fresh and exciting.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              What We Offer
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <strong className="text-white">Random Champion Generator:</strong> Get assigned 
                  a random champion for your next game, with the option to filter by lane.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <strong className="text-white">Match Verification:</strong> We use Riot's official 
                  API to verify that you played with the assigned champion and track your wins.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <strong className="text-white">Progression System:</strong> Earn XP, level up, 
                  unlock achievements, and build win streaks as you complete challenges.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <strong className="text-white">Global Competition:</strong> Compete with players 
                  worldwide on the leaderboard.
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              Privacy & Security
            </h2>
            <p className="mb-3">
              We take your privacy seriously. League Roulette:
            </p>
            <ul className="space-y-2 list-disc ml-6">
              <li>Never asks for your password</li>
              <li>Uses Riot's official API for secure authentication</li>
              <li>Only stores your public Riot ID and game statistics</li>
              <li>Does not sell or share your data with third parties</li>
              <li>Complies with GDPR and privacy regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              Community
            </h2>
            <p>
              League Roulette is made by gamers, for gamers. We're constantly working to improve 
              the experience based on your feedback. Join our Discord community to share your 
              experiences, suggest features, and connect with other players taking on the challenge!
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              Get in Touch
            </h2>
            <p className="mb-4">
              Have questions, feedback, or suggestions? We'd love to hear from you!
            </p>
            <div className="flex gap-4">
              <a 
                href="/contact" 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition"
              >
                Contact Us
              </a>
              <a 
                href="https://discord.gg/leagueroulette" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-semibold transition"
              >
                Join Discord
              </a>
            </div>
          </section>

          <section className="pt-8 border-t border-neutral-800">
            <p className="text-sm text-neutral-500">
              League Roulette isn't endorsed by Riot Games and doesn't reflect the views or 
              opinions of Riot Games or anyone officially involved in producing or managing 
              Riot Games properties. League of Legends and Riot Games are trademarks or 
              registered trademarks of Riot Games, Inc.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}