// components/UserStats.tsx
'use client'

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
  const progress = levelProgress(user.xp)

  return (
    <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">

        {/* LEFT SIDE (Icon + Info) */}
        <div className="flex items-center gap-4">

          {/* Profile Icon (LoL) */}
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${user.profile_icon_id}.png`}
              alt="Profile Icon"
              className="w-16 h-16 rounded-full border-2 border-[#C89B3C]"
            />

          {/* Name + Levels */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {user.summoner_name}
            </h2>

            {/* LoL Level (nuevo) */}
            {user.summoner_level && (
              <p className="text-[#C89B3C] text-sm font-semibold">
                LoL Level {user.summoner_level}
              </p>
            )}

            {/* App Level (ya existente, no se toca) */}
            <p className="text-neutral-400 text-sm">
              Level {user.level}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE (ya existente, intacto) */}
        <div className="text-right">
          <p className="text-neutral-400 text-sm">Total Challenges</p>
          <p className="text-3xl font-bold text-white">
            {user.total_challenges_completed}
          </p>
        </div>
      </div>

      {/* XP Progress Bar (NO TOCADO) */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-neutral-500 mb-2">
          <span>XP: {user.xp}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Streak Info (NO TOCADO) */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-neutral-500 text-xs">Current Streak</p>
            <p className="text-white font-bold text-lg">
              {user.current_streak}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <div>
            <p className="text-neutral-500 text-xs">Best Streak</p>
            <p className="text-white font-bold text-lg">
              {user.longest_streak}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}