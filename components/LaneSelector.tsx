"use client";

import { useTranslations } from 'next-intl'

interface LaneSelectorProps {
  selectedLane: string;
  onLaneChange: (lane: string) => void;
  disabled?: boolean;
}

const LANES = [
  { id: 'all', iconKey: 'all', nameKey: 'allLanes', descKey: 'anyChampion' },
  { id: 'top', iconKey: 'topShort', nameKey: 'top', descKey: 'islandLife' },
  { id: 'jungle', iconKey: 'jng', nameKey: 'jungle', descKey: 'pveSimulator' },
  { id: 'mid', iconKey: 'midShort', nameKey: 'mid', descKey: 'mainCharacter' },
  { id: 'adc', iconKey: 'adcShort', nameKey: 'adc', descKey: 'glassCannon' },
  { id: 'support', iconKey: 'sup', nameKey: 'support', descKey: 'teamPlayer' },
];

export default function LaneSelector({ selectedLane, onLaneChange, disabled = false }: LaneSelectorProps) {
  const t = useTranslations('laneSelector');

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        <p className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase font-display"
           style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
          {t('selectLane')}
        </p>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {LANES.map((lane) => {
          const isActive = selectedLane === lane.id;
          return (
            <button
              key={lane.id}
              onClick={() => onLaneChange(lane.id)}
              disabled={disabled}
              className={`
                relative group px-3 py-4 rounded-lg border transition-all duration-300
                flex flex-col items-center gap-1
                disabled:opacity-40 disabled:cursor-not-allowed
                ${isActive
                  ? 'border-cyan-400/70 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-800/50'
                }
              `}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-lg border border-cyan-400/30 animate-pulse-border pointer-events-none" />
              )}
              <span className={`
                text-[11px] font-bold tracking-widest
                ${isActive ? 'text-cyan-300' : 'text-zinc-500 group-hover:text-zinc-300'}
                transition-colors duration-300
              `}
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {t(lane.iconKey)}
              </span>
              <span className={`
                text-[10px] tracking-[0.15em] uppercase
                ${isActive ? 'text-cyan-400' : 'text-zinc-600 group-hover:text-zinc-400'}
                transition-colors duration-300
              `}>
                {t(lane.nameKey)}
              </span>
              <span className="text-[8px] text-zinc-700 group-hover:text-zinc-500 transition-colors duration-300">
                {t(lane.descKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
