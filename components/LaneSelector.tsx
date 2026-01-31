// components/LaneSelector.tsx
'use client'

const LANES = [
  { id: 'all', name: 'All Lanes', icon: '🎲' },
  { id: 'top', name: 'Top', icon: '⬆️' },
  { id: 'jungle', name: 'Jungle', icon: '🌲' },
  { id: 'mid', name: 'Mid', icon: '⭐' },
  { id: 'adc', name: 'ADC', icon: '🏹' },
  { id: 'support', name: 'Support', icon: '💚' },
]

interface LaneSelectorProps {
  selectedLane: string
  onLaneChange: (lane: string) => void
  disabled?: boolean
}

export default function LaneSelector({ 
  selectedLane, 
  onLaneChange, 
  disabled = false 
}: LaneSelectorProps) {
  return (
    <div className="mb-8">
      <p className="text-neutral-500 text-xs tracking-widest uppercase font-light mb-4 text-center">
        Select Lane
      </p>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {LANES.map((lane) => (
          <button
            key={lane.id}
            onClick={() => onLaneChange(lane.id)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded-xl border transition-all duration-300
              flex flex-col items-center gap-2 text-sm font-light
              disabled:opacity-50 disabled:cursor-not-allowed
              ${selectedLane === lane.id 
                ? 'bg-white/10 border-white/40 text-white shadow-lg scale-105' 
                : 'bg-neutral-900/40 border-neutral-800/50 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/40 hover:scale-105'
              }
            `}
          >
            <span className="text-2xl">{lane.icon}</span>
            <span className="tracking-wider uppercase text-[10px]">
              {lane.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}