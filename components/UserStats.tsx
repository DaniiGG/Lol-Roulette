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
  }
}

export default function UserStats({ user }: UserStatsProps) {
  const progress = levelProgress(user.xp, user.level)

  return (
    <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {user.summoner_name}
          </h2>
          <p className="text-neutral-400 text-sm">
            Level {user.level}
          </p>
        </div>
        <div className="text-right">
          <p className="text-neutral-400 text-sm">Total Challenges</p>
          <p className="text-3xl font-bold text-white">
            {user.total_challenges_completed}
          </p>
        </div>
      </div>

      {/* XP Progress Bar */}
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

      {/* Streak Info */}
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