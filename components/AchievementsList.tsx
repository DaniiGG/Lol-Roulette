// components/AchievementsList.tsx
'use client'

import { ACHIEVEMENTS } from '@/lib/achievements'
import AchievementBadge from './AchievementBadge'

interface AchievementsListProps {
  unlockedAchievements: string[]
  newAchievements?: string[]
}

export default function AchievementsList({ 
  unlockedAchievements, 
  newAchievements = [] 
}: AchievementsListProps) {
  return (
    <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Achievements</h3>
        <span className="text-neutral-400 text-sm">
          {unlockedAchievements.length}/{Object.keys(ACHIEVEMENTS).length}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
        {Object.keys(ACHIEVEMENTS).map((type) => (
          <AchievementBadge
            key={type}
            achievementType={type}
            unlocked={unlockedAchievements.includes(type)}
            showAnimation={newAchievements.includes(type)}
          />
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}