// components/AchievementBadge.tsx
'use client'

import { useTranslations } from 'next-intl'
import { ACHIEVEMENTS, AchievementDefinition } from '@/lib/achievements'
import { motion } from 'framer-motion'

interface AchievementBadgeProps {
  achievementType: string
  unlocked?: boolean
  unlockedAt?: string
  showAnimation?: boolean
}

export default function AchievementBadge({ 
  achievementType, 
  unlocked = false,
  unlockedAt,
  showAnimation = false 
}: AchievementBadgeProps) {
  const t = useTranslations('achievements')
  const achievement = ACHIEVEMENTS[achievementType as keyof typeof ACHIEVEMENTS]
  
  if (!achievement) return null

  const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-600'
  }

  const rarityBorder = {
    common: 'border-gray-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400'
  }

  return (
    <motion.div
      initial={showAnimation ? { scale: 0, rotate: -180 } : {}}
      animate={showAnimation ? { scale: 1, rotate: 0 } : {}}
      transition={{ type: 'spring', duration: 0.8 }}
      className={`
        relative p-4 rounded-xl border-2
        ${unlocked ? rarityBorder[achievement.rarity] : 'border-neutral-700'}
        ${unlocked 
          ? `bg-gradient-to-br ${rarityColors[achievement.rarity]}` 
          : 'bg-neutral-800/50'
        }
        ${!unlocked && 'opacity-50 grayscale'}
        transition-all duration-300 hover:scale-105
      `}
    >
      {/* Icon */}
      <div className="text-4xl mb-2 flex items-center justify-center">
        <img src={achievement.icon} alt={achievement.name} className="w-20 h-20" />
      </div>

      {/* Name */}
      <h3 className={`
        text-sm font-bold text-center mb-1
        ${unlocked ? 'text-white' : 'text-neutral-500'}
      `}>
        {achievement.name}
      </h3>

      {/* Description */}
      <p className={`
        text-xs text-center
        ${unlocked ? 'text-white/80' : 'text-neutral-600'}
      `}>
        {achievement.description}
      </p>

      {/* XP Reward */}
      <div className={`
        mt-2 text-center text-xs font-semibold
        ${unlocked ? 'text-yellow-300' : 'text-neutral-600'}
      `}>
        {t('xpReward', { xp: achievement.xpReward })}
      </div>

      {/* Unlocked Date */}
      {unlocked && unlockedAt && (
        <div className="mt-2 text-center text-[10px] text-white/60">
          {new Date(unlockedAt).toLocaleDateString()}
        </div>
      )}

      {/* Locked Overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl">🔒</div>
        </div>
      )}

      {/* Rarity Badge */}
      <div className={`
        absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold
        ${unlocked 
          ? 'bg-white/20 text-white' 
          : 'bg-neutral-700 text-neutral-500'
        }
      `}>
        {t(achievement.rarity)}
      </div>
    </motion.div>
  )
}
