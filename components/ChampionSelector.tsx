// components/ChampionSelector.tsx
'use client'

interface Champion {
  id: string
  key: number
  name: string
  lane?: string
}

interface ChampionSelectorProps {
  champions: Champion[]
  onSelect: (champion: Champion) => void
  canReroll: boolean
  rerollsLeft: number
  onReroll: () => void
  disabled?: boolean
}

export default function ChampionSelector({
  champions,
  onSelect,
  canReroll,
  rerollsLeft,
  onReroll,
  disabled = false
}: ChampionSelectorProps) {
  const LOADING_BASE = 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/'

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          {champions.length === 1 ? 'Your Champion' : 'Choose Your Champion'}
        </h2>
        <p className="text-neutral-400">
          {champions.length === 1 
            ? 'Click to confirm or reroll for more options'
            : `Select one champion to play (${champions.length} options available)`
          }
        </p>
      </div>

      {/* Champion Cards Grid */}
      <div className={`grid gap-6 mb-6 ${
        champions.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
        champions.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-3'
      }`}>
        {champions.map((champion, index) => (
          <button
            key={`${champion.id}-${index}`}
            onClick={() => !disabled && onSelect(champion)}
            disabled={disabled}
            className={`
              group relative overflow-hidden rounded-2xl
              bg-neutral-900 border-2 border-neutral-700
              hover:border-[#C89B3C] hover:scale-105
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:scale-100 disabled:hover:border-neutral-700
            `}
          >
            {/* Champion Image */}
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={`${LOADING_BASE}${champion.id}_0.jpg`}
                alt={champion.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`
                }}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Hover glow */}
              <div className="absolute inset-0 bg-[#C89B3C]/0 group-hover:bg-[#C89B3C]/20 transition-all duration-300" />
            </div>

            {/* Champion Name */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                {champion.name}
              </h3>
              {champion.lane && (
                <p className="text-neutral-300 text-sm drop-shadow">
                  {champion.lane}
                </p>
              )}
              
              {/* Play Button Overlay */}
              <div className="mt-3 px-4 py-2 rounded-lg bg-[#C89B3C] text-neutral-950 font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity">
                ✓ Play with {champion.name}
              </div>
            </div>

            {/* Option Number Badge */}
            {champions.length > 1 && (
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-950/80 border-2 border-[#C89B3C] flex items-center justify-center">
                <span className="text-[#C89B3C] font-bold text-lg">
                  {index + 1}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Reroll Button */}
      {canReroll && rerollsLeft > 0 && (
        <div className="text-center">
          <button
            onClick={onReroll}
            disabled={disabled}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg
              transition-all duration-200
              ${disabled
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-neutral-800 text-white hover:bg-neutral-700 hover:scale-105 active:scale-95'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reroll ({rerollsLeft === Infinity ? 'Unlimited' : `${rerollsLeft} left`})
            </span>
          </button>
          
          <p className="text-neutral-500 text-sm mt-3">
            {rerollsLeft === Infinity ? 'Don\'t like these options? You have unlimited spins' : `Don't like these options? You have ${rerollsLeft} more ${rerollsLeft === 1 ? 'spin' : 'spins'}`}
          </p>
        </div>
      )}

      {/* No Rerolls Left Message */}
      {champions.length > 1 && rerollsLeft === 0 && (
        <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-blue-300">
            ✨ Choose wisely! No rerolls remaining
          </p>
        </div>
      )}
    </div>
  )
}