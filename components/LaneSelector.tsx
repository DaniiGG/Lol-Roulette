"use client";

import Image from 'next/image'
import machineStyles from './RouletteAppearance.module.css'
import { useTranslations } from 'next-intl'

interface LaneSelectorProps {
  selectedLane: string;
  onLaneChange: (lane: string) => void;
  disabled?: boolean;
}

const LANES = [
  { id: 'all', image: '/images/poli.webp', nameKey: 'allLanes' },
  { id: 'top', image: '/images/top.webp', nameKey: 'top' },
  { id: 'jungle', image: '/images/jungle.webp', nameKey: 'jungle' },
  { id: 'mid', image: '/images/middle.webp', nameKey: 'mid' },
  { id: 'adc', image: '/images/bottom.webp', nameKey: 'adc' },
  { id: 'support', image: '/images/support.webp', nameKey: 'support' },
];

export default function LaneSelector({ selectedLane, onLaneChange, disabled = false }: LaneSelectorProps) {
  const t = useTranslations('laneSelector');

  return (
    <div className={machineStyles.surface}>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        <p className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase font-display"
           style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
          {t('selectLane')}
        </p>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {LANES.map((lane) => {
          const isActive = selectedLane === lane.id;
          return (
            <button
              key={lane.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onLaneChange(lane.id)}
              disabled={disabled}
              className={`
                relative group min-w-0 px-1 py-2 rounded-lg border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400
                flex flex-col items-center justify-center gap-1.5
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
              <Image
                src={lane.image}
                alt=""
                width={32}
                height={32}
                sizes="32px"
                className={`h-8 w-8 object-contain transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-65 group-hover:opacity-100'}`}
              />
              <span className={`
                w-full text-center text-[10px] leading-tight font-medium
                ${isActive ? 'text-cyan-300' : 'text-zinc-400 group-hover:text-zinc-200'}
                transition-colors duration-300
              `}>
                {t(lane.nameKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
