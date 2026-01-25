"use client"

import { useState } from "react"

export default function Home() {
  const [champ, setChamp] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)

  const spin = async () => {
    setLoading(true)
    setSpinning(true)
    
    setTimeout(async () => {
      const res = await fetch("/api/roulette")
      const data = await res.json()
      setChamp(data)
      setLoading(false)
      setTimeout(() => setSpinning(false), 500)
    }, 2000)
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Minimal glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-extralight tracking-tight text-white mb-4 opacity-90">
              League Roulette
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-neutral-500 to-transparent"></div>
              <p className="text-neutral-400 font-light tracking-widest text-sm uppercase">
                Discover your champion
              </p>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-neutral-500 to-transparent"></div>
            </div>
          </div>

          {/* Main Card */}
          <div className="relative">
            {/* Subtle outer glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-neutral-700/20 to-neutral-800/20 rounded-3xl blur-sm"></div>
            
            {/* Card */}
            <div className="relative bg-neutral-900/40 backdrop-blur-xl rounded-3xl border border-neutral-800/50 overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent"></div>

              <div className="p-8 md:p-12">
                {/* Champion Display */}
                <div className="relative h-96 mb-8 rounded-2xl overflow-hidden bg-neutral-950/50 border border-neutral-800/30">
                  {spinning && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-neutral-950/60 backdrop-blur-md">
                      <div className="relative">
                        {/* Elegant spinner */}
                        <div className="w-16 h-16 border border-neutral-700/30 rounded-full relative">
                          <div className="absolute inset-0 border-t-2 border-white/80 rounded-full animate-spin"></div>
                        </div>
                        <div className="absolute -inset-8 border border-neutral-700/20 rounded-full"></div>
                        <div className="absolute -inset-12 border border-neutral-700/10 rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {champ && !spinning ? (
                    <div className="relative h-full group">
                      {/* Image with elegant fade-in */}
                      <div className="absolute inset-0 animate-elegant-reveal">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`}
                          alt={champ.name}
                          className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                        />
                      </div>
                      
                      {/* Sophisticated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-90"></div>
                      
                      {/* Champion info */}
                      <div className="absolute inset-x-0 bottom-0 p-8">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-px w-8 bg-white/60"></div>
                            <span className="text-xs text-neutral-400 tracking-[0.2em] uppercase font-light">
                              Selected Champion
                            </span>
                          </div>
                          <h2 className="text-5xl md:text-6xl font-extralight text-white tracking-tight">
                            {champ.name}
                          </h2>
                        </div>
                      </div>

                      {/* Subtle corner accent */}
                      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-white/20 rounded-tr-lg"></div>
                    </div>
                  ) : !spinning && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 border border-neutral-700/40 rounded-full flex items-center justify-center">
                          <div className="w-16 h-16 border border-neutral-600/40 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-400 font-light text-lg tracking-wide">
                        Ready to begin
                      </p>
                      <p className="text-neutral-600 text-sm mt-2 font-light">
                        Press the button below
                      </p>
                    </div>
                  )}
                </div>

                {/* Spin Button */}
                <button
                  onClick={spin}
                  disabled={loading}
                  className="
                    group/btn
                    w-full py-6 rounded-2xl 
                    bg-white text-neutral-950
                    hover:bg-neutral-100
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-500
                    relative overflow-hidden
                    font-light text-base tracking-widest uppercase
                  "
                >
                  {/* Button background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border border-neutral-950/20 border-t-neutral-950 rounded-full animate-spin"></div>
                        <span>Processing</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs opacity-60">—</span>
                        <span>Spin Roulette</span>
                        <span className="text-xs opacity-60">—</span>
                      </>
                    )}
                  </span>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-neutral-950 group-hover/btn:w-3/4 transition-all duration-700"></div>
                </button>

                {/* Champion details (if selected) */}
                {champ && !spinning && (
                  <div className="mt-8 pt-8 border-t border-neutral-800/30">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center group/stat cursor-default">
                        <div className="mb-3 flex justify-center">
                          <div className="w-10 h-10 border border-neutral-700/30 rounded-lg flex items-center justify-center group-hover/stat:border-neutral-600/50 transition-colors duration-300">
                            <span className="text-neutral-500 text-lg">⚔</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 tracking-wider uppercase font-light">Offense</p>
                      </div>
                      <div className="text-center group/stat cursor-default">
                        <div className="mb-3 flex justify-center">
                          <div className="w-10 h-10 border border-neutral-700/30 rounded-lg flex items-center justify-center group-hover/stat:border-neutral-600/50 transition-colors duration-300">
                            <span className="text-neutral-500 text-lg">🛡</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 tracking-wider uppercase font-light">Defense</p>
                      </div>
                      <div className="text-center group/stat cursor-default">
                        <div className="mb-3 flex justify-center">
                          <div className="w-10 h-10 border border-neutral-700/30 rounded-lg flex items-center justify-center group-hover/stat:border-neutral-600/50 transition-colors duration-300">
                            <span className="text-neutral-500 text-lg">✦</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 tracking-wider uppercase font-light">Magic</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/30 to-transparent"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-neutral-600 text-xs tracking-widest uppercase font-light">
              League of Legends Champion Selector
            </p>
          </div>
        </div>
      </div>

      
    </main>
  )
}