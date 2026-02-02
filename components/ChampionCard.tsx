// components/ChampionCard.tsx
'use client'

interface ChampionCardProps {
  champion?: {
    id: string
    name: string
    key: number
    tags?: string[]
  } | null
  spinning: boolean
  onSpin: () => void
  onVerify?: () => void
  loading: boolean
  verifying?: boolean
  showVerify?: boolean
}

export default function ChampionCard({ 
  champion, 
  spinning, 
  onSpin, 
  onVerify,
  loading,
  verifying = false,
  showVerify = false
}: ChampionCardProps) {
  // DEBUG: Ver qué props llegan
  console.log('🎴 ChampionCard props:', {
    champion,
    spinning,
    loading,
    showVerify,
    hasOnVerify: !!onVerify
  })

  return (
    <div className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl border border-neutral-800/50 overflow-hidden">
      {/* Champion Display */}
      <div className="relative h-96 rounded-2xl overflow-hidden bg-neutral-950/50">
        {/* Spinner Overlay */}
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

        {/* Champion Display */}
        {champion && !spinning ? (
          <div className="relative h-full group">
            {/* Champion Splash Art */}
            <div className="absolute inset-0">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`}
                alt={champion.name}
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
              />
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-90"></div>
            
            {/* Champion Info */}
            <div className="absolute inset-x-0 bottom-0 p-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-white/60"></div>
                  <span className="text-xs text-neutral-400 tracking-[0.2em] uppercase font-light">
                    Your Champion
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-extralight text-white tracking-tight">
                  {champion.name}
                </h2>
                
                {/* Tags */}
                {champion.tags && (
                  <div className="flex gap-2 mt-3">
                    {champion.tags.map((tag: string) => (
                      <span 
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 tracking-wider uppercase font-light"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-white/20 rounded-tr-lg"></div>
          </div>
        ) : !spinning && (
          // Empty State
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

      {/* Action Buttons */}
      <div className="p-6 space-y-3">
        {!champion ? (
          // Spin Button (cuando NO hay campeón)
          <button
            onClick={onSpin}
            disabled={loading}
            className="
              group/btn w-full py-4 rounded-xl 
              bg-white text-neutral-950
              hover:bg-neutral-100
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-500
              relative overflow-hidden
              font-light text-base tracking-widest uppercase
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            
            <span className="relative z-10 flex items-center justify-center gap-4">
              {loading ? (
                <>
                  <div className="w-4 h-4 border border-neutral-950/20 border-t-neutral-950 rounded-full animate-spin"></div>
                  <span>Spinning</span>
                </>
              ) : (
                <>
                  <span className="text-xs opacity-60">—</span>
                  <span>Spin Roulette</span>
                  <span className="text-xs opacity-60">—</span>
                </>
              )}
            </span>
          </button>
        ) : showVerify ? (
          // Verify Button (cuando HAY campeón Y usuario logueado)
          <>
            <button
              onClick={onVerify}
              disabled={verifying}
              className="
                w-full py-4 rounded-xl 
                bg-gradient-to-r from-green-600 to-emerald-600
                text-white font-semibold
                hover:from-green-500 hover:to-emerald-500
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-300
                hover:scale-105 active:scale-95
              "
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                'Verify Match'
              )}
            </button>
            
            {/* New Challenge Button (usuario logueado) */}
            <button
              onClick={onSpin}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 transition disabled:opacity-40 text-sm"
            >
              <span className="text-xs opacity-60">—</span>
                  <span>Spin Again</span>
              <span className="text-xs opacity-60">—</span>
            </button>
          </>
        ) : (
          // New Challenge Button (cuando HAY campeón pero NO está logueado)
          <button
            onClick={onSpin}
            disabled={loading}
            className="
              group/btn w-full py-4 rounded-xl 
              bg-white text-neutral-950
              hover:bg-neutral-100
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-500
              relative overflow-hidden
              font-light text-base tracking-widest uppercase
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            
            <span className="relative z-10 flex items-center justify-center gap-4">
              {loading ? (
                <>
                  <div className="w-4 h-4 border border-neutral-950/20 border-t-neutral-950 rounded-full animate-spin"></div>
                  <span>Spinning</span>
                </>
              ) : (
                <>
                  <span className="text-xs opacity-60">—</span>
                  <span>Spin Roulette</span>
                  <span className="text-xs opacity-60">—</span>
                </>
              )}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}