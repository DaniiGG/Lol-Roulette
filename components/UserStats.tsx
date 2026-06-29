"use client";

import { useTranslations } from 'next-intl'
import { levelProgress } from '@/lib/achievements'

interface UserStatsProps {
  user: {
    summoner_name: string
    level: number
    xp: number
    current_streak: number
    longest_streak: number
    total_challenges_completed: number
    summoner_level?: number
    profile_icon_id?: number
  }
}

export default function UserStats({ user }: UserStatsProps) {
  const t = useTranslations('userStats');
  const progress = levelProgress(user.xp)

  return (
    <div className="relative">
      <div className="relative bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-zinc-800/60 p-3">
        <div className="relative z-10 flex items-center gap-4">
          {user.profile_icon_id && (
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${user.profile_icon_id}.png`}
              alt=""
              className="w-10 h-10 rounded-full border border-cyan-400/40 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white truncate">{user.summoner_name}</h2>
              <span className="text-cyan-400 text-[10px] font-semibold whitespace-nowrap">{t('level', { level: user.level })}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden max-w-[120px]">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00e5ff, #00b8d4)' }} />
              </div>
              <span className="text-zinc-500 text-[10px]">🔥{user.current_streak} | 👑{user.longest_streak}</span>
              <span className="text-zinc-600 text-[10px]">|</span>
              <span className="text-zinc-500 text-[10px]">{t('challenges')} {user.total_challenges_completed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
