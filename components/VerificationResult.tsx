// components/VerificationResult.tsx
'use client'

interface VerificationResultProps {
  result: {
    pending?: boolean
    message?: string
    success?: boolean
    playedCorrectChampion?: boolean
    won?: boolean
    championPlayed?: string
    stats?: {
      kills: number
      deaths: number
      assists: number
      cs: number
      gold: number
    }
  }
  championName: string
}

export default function VerificationResult({ result, championName }: VerificationResultProps) {
  if (result.pending) {
    return (
      <div className="p-6 rounded-2xl border-2 bg-neutral-800/30 border-neutral-700/60 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-neutral-500/40 border-t-neutral-200 rounded-full animate-spin"></div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-200">Waiting for a new match</h3>
            <p className="text-neutral-400 text-sm">
              {result.message || 'No new match detected yet. We will keep checking.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`
      p-6 rounded-2xl border-2 animate-fade-in
      ${result.success 
        ? 'bg-green-500/10 border-green-500/50' 
        : 'bg-red-500/10 border-red-500/50'
      }
    `}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">
          {result.success ? '✅' : '❌'}
        </span>
        <div>
          <h3 className={`text-2xl font-bold ${
            result.success ? 'text-green-400' : 'text-red-400'
          }`}>
            {result.success ? 'Victory!' : 'Challenge Failed'}
          </h3>
          <p className="text-white text-sm">
            {result.playedCorrectChampion 
              ? `You played ${result.championPlayed}` 
              : `You played ${result.championPlayed}, not ${championName}`
            }
            {result.playedCorrectChampion && !result.won && ' but lost'}
          </p>
        </div>
      </div>

      {/* Stats */}
      {result.stats && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-neutral-400 text-xs mb-1">KDA</p>
            <p className="text-white font-bold text-lg">
              {result.stats.kills}/{result.stats.deaths}/{result.stats.assists}
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              {result.stats.deaths === 0 
                ? 'Perfect' 
                : ((result.stats.kills + result.stats.assists) / result.stats.deaths).toFixed(1)
              }
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-neutral-400 text-xs mb-1">CS</p>
            <p className="text-white font-bold text-lg">
              {result.stats.cs}
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              Minions
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-neutral-400 text-xs mb-1">Gold</p>
            <p className="text-white font-bold text-lg">
              {Math.round(result.stats.gold / 1000)}k
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              Earned
            </p>
          </div>
        </div>
      )}

      {/* Success message */}
      {result.success && (
        <div className="mt-4 text-center">
          <p className="text-green-400 font-semibold">
            +100 XP earned! 🎉
          </p>
        </div>
      )}
    </div>
  )
}
