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
    <div className="relative group">
      {/* Animated border glow */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 pointer-events-none" />

      <div className="relative bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800/80 p-5 overflow-hidden">
        {/* Subtle scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/30 to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {user.profile_icon_id && (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md" />
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${user.profile_icon_id}.png`}
                    alt=""
                    className="w-14 h-14 rounded-full border-2 border-cyan-400/60 relative z-10"
                  />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {user.summoner_name}
                </h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">
                    {t('level', { level: user.level })}
                  </span>
                  {user.summoner_level && (
                    <>
                      <span className="text-zinc-700">|</span>
                      <span className="text-zinc-500 text-xs">
                        {t('lolLevel', { level: user.summoner_level })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-zinc-500 text-[10px] tracking-wider uppercase">{t('challenges')}</p>
              <p className="text-2xl font-bold text-white font-display tracking-wide"
                 style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {user.total_challenges_completed}
              </p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5 tracking-wider uppercase">
              <span>{t('xpProgress')}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full relative overflow-hidden transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #00e5ff, #00b8d4, #00e5ff)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-zinc-800/40 rounded-lg p-3 border border-zinc-800/50">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-zinc-500 text-[10px] tracking-wider uppercase">{t('currentStreak')}</p>
                <p className="text-white font-bold text-lg leading-tight">{user.current_streak}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/40 rounded-lg p-3 border border-zinc-800/50">
              <span className="text-lg">👑</span>
              <div>
                <p className="text-zinc-500 text-[10px] tracking-wider uppercase">{t('bestStreak')}</p>
                <p className="text-white font-bold text-lg leading-tight">{user.longest_streak}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
