// app/tips/page.tsx
export default function TipsPage() {
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Strategy & Champion Tips</h1>
          <p className="text-xl text-neutral-400">Master the art of playing random champions</p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          
          {/* Introduction */}
          <section className="p-8 rounded-2xl bg-gradient-to-br from-[#C89B3C]/10 to-transparent border border-[#C89B3C]/30">
            <p className="text-neutral-300 text-lg leading-relaxed">
              Playing random champions is one of the best ways to improve at League of Legends. This guide will help you succeed with unfamiliar champions, understand different playstyles, and develop the adaptability needed to win with anyone. Whether you're a veteran or newcomer, these strategies will elevate your random champion gameplay.
            </p>
          </section>

          {/* General Tips */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">General Tips for Success</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">🎯 Master the Fundamentals</h3>
                <p className="text-neutral-300 leading-relaxed mb-2">
                  When you can't rely on champion-specific mechanics, your fundamentals become even more important. Focus on:
                </p>
                <ul className="space-y-2 text-neutral-300 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>CS'ing:</strong> Last-hitting minions is universal across all champions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Map awareness:</strong> Watch minimap, track enemy jungler, ward key areas</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Positioning:</strong> Stay safe in teamfights, respect enemy threats</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Wave management:</strong> Freeze when ahead, push when roaming</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">📖 Quick Champion Research</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Before the game starts, spend 2-3 minutes learning your champion. Read ability descriptions in champion select, check recommended builds, and watch a quick 30-second YouTube clip if available. Understanding what each ability does will dramatically improve your performance.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">🛡️ Play Safe Early Game</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Don't try to make flashy plays with unfamiliar champions. Focus on farming safely, learning your damage output, and understanding your power spikes. It's better to go 0/0/0 with good farm than to feed trying to learn combos in real time.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">💭 Think About Win Conditions</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Even if you don't know all the mechanics, you can understand your role: Are you a tank meant to engage? A carry who needs gold? A support enabling teammates? Play towards your champion's natural strengths rather than forcing unfamiliar playstyles.
                </p>
              </div>
            </div>
          </section>

          {/* Lane-Specific Tips */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">Lane-Specific Strategies</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-2xl font-semibold text-white mb-4">⚔️ Top Lane</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">
                  Top lane is an island where 1v1 skill determines success. Most random top laners will be either bruisers or tanks.
                </p>
                <ul className="space-y-2 text-neutral-300">
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Trading stance:</strong> Position aggressively when enemy is last-hitting</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Wave control:</strong> Freeze near your tower when ahead, essential for top</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>TP usage:</strong> Save teleport for bot lane plays or getting back to lane</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Split pushing:</strong> Most top laners excel at side lane pressure late game</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-2xl font-semibold text-white mb-4">🌲 Jungle</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">
                  Jungle is the most game-knowledge-dependent role. Focus on these basics with random junglers:
                </p>
                <ul className="space-y-2 text-neutral-300">
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Clear efficiency:</strong> Learn the optimal clear path - usually start Raptors or Buff</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Gank setup:</strong> Only gank lanes with CC or when enemies are overextended</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Objective control:</strong> Dragons and Rift Herald win games, prioritize them</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Track enemy jungler:</strong> Ward their jungle, ping locations to team</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-2xl font-semibold text-white mb-4">⚡ Mid Lane</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">
                  Mid lane has the most diverse champion pool - from mages to assassins to bruisers.
                </p>
                <ul className="space-y-2 text-neutral-300">
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Roaming:</strong> Push wave then roam to side lanes, mid has the best roam access</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Mana management:</strong> Many mid laners are mana-gated, don't spam abilities</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Assassin vs Mage:</strong> Assassins look for picks, mages provide teamfight DPS</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Vision control:</strong> Ward both river bushes to avoid ganks</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-2xl font-semibold text-white mb-4">🏹 ADC (Bot Lane)</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">
                  ADCs are mechanically demanding but follow similar patterns across all champions.
                </p>
                <ul className="space-y-2 text-neutral-300">
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Attack move:</strong> Use A-click to kite and avoid misclicks</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Positioning:</strong> Stay max range in fights, behind your frontline</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Trading in lane:</strong> Auto-attack when enemy goes for CS</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Scaling focus:</strong> Most ADCs need 2-3 items to be strong, farm safely</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-2xl font-semibold text-white mb-4">🛡️ Support</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">
                  Support has the most varied playstyles - enchanters, tanks, mages all play differently.
                </p>
                <ul className="space-y-2 text-neutral-300">
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Vision game:</strong> Always have wards up, deny enemy vision with sweeper</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Engage vs Peel:</strong> Tank supports engage, enchanters protect carries</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Roaming:</strong> When ADC is safely farming, roam mid for plays</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">•</span>
                    <span><strong>Gold efficiency:</strong> Support items provide scaling, complete your quest</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Champion Archetypes */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">Understanding Champion Archetypes</h2>
            
            <p className="text-neutral-300 leading-relaxed mb-6">
              Even if you don't know a specific champion, you can figure out how to play them by their archetype. Here are the main categories:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-2">🗡️ Assassins</h3>
                <p className="text-neutral-400 text-sm">
                  High mobility, burst damage. Look for isolated targets, delete squishies, escape. Play aggressive mid-game, fall off late.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-2">⚔️ Bruisers/Fighters</h3>
                <p className="text-neutral-400 text-sm">
                  Tanky damage dealers. Dive backline or split push. Build one damage item, then tank. Strongest 1v1 class.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-2">🛡️ Tanks</h3>
                <p className="text-neutral-400 text-sm">
                  Engage/peel for team. Stack HP/resistances. Initiate fights with CC. Absorb damage so carries can output DPS.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-2">🏹 Marksmen</h3>
                <p className="text-neutral-400 text-sm">
                  Ranged DPS. Farm to 3 items, then scale. Stay max range. Kill frontline first, then backline. Win through sustained damage.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-2">✨ Mages</h3>
                <p className="text-neutral-400 text-sm">
                  Ability-based damage. Poke or burst patterns. Manage mana. Control zones with abilities. Strong mid-game spike.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-2">💚 Enchanters</h3>
                <p className="text-neutral-400 text-sm">
                  Buff allies, heal/shield. Stay back, enable carries. Build support items. Win through making teammates stronger.
                </p>
              </div>
            </div>
          </section>

          {/* Mental Game */}
          <section className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-6">The Mental Game</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">🧠 Embrace the Learning Process</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Playing random champions is about growth, not just winning. Every game teaches you something new - how a champion feels, what counters them, what their power spikes are. Even losses are valuable learning experiences.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">💬 Communicate with Your Team</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Let your team know you're trying a new champion. Most players are understanding and might even give you tips. Type something like "first time on this champ, playing safe" in lobby or early game.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">🎯 Set Realistic Goals</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Don't expect to carry every game with unfamiliar champions. Set achievable goals: farm well, don't feed, learn the abilities, make smart decisions. Small victories add up to big improvements.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">😊 Stay Positive</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Tilt is the enemy of learning. If you're getting frustrated, take a break. Remember that even pro players struggled when learning new champions. The challenge is what makes League Roulette fun!
                </p>
              </div>
            </div>
          </section>

          {/* Advanced Tips */}
          <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-6">Advanced Strategies</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">📚 Build Knowledge Database</h3>
                <p className="text-neutral-300 leading-relaxed">
                  After playing a champion, take mental notes: What felt strong? What was difficult? What items worked? This knowledge compounds over time, making future random champion games easier.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">🎮 Practice Tool Warm-Up</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Spend 2-3 minutes in practice tool before your match. Test ability ranges, practice combos, check damage numbers. This brief warm-up can dramatically improve your confidence.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">📊 Analyze Your Games</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Review your matches - what worked, what didn't? Did you die to lack of knowledge or poor fundamentals? Use losses to identify areas for improvement beyond just champion mechanics.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#C89B3C] mb-2">👥 Learn from Others</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Watch high-level players on YouTube or Twitch. Even a 5-minute clip can teach you combos, builds, or playstyles for champions you might get in League Roulette.
                </p>
              </div>
            </div>
          </section>

          {/* Final Motivation */}
          <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border border-[#C89B3C]/50">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Improve?</h2>
            <p className="text-neutral-300 text-lg mb-6">
              Every random champion game makes you a better League of Legends player. Use these strategies, stay positive, and embrace the challenge!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/"
                className="px-8 py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition text-lg"
              >
                Start Playing
              </a>
              <a
                href="/how-to-play"
                className="px-8 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition text-lg"
              >
                Learn the Basics
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}