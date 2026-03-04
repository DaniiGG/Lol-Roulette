// lib/achievements.ts

export type AchievementType = 
  | 'first_win'
  | 'streak_3'
  | 'streak_5'
  | 'streak_10'
  | 'challenges_5'
  | 'challenges_10'
  | 'challenges_25'
  | 'challenges_50'
  | 'challenges_100'
  | 'level_10'
  | 'level_25'
  | 'level_50'
  | 'all_lanes'
  | 'off_meta'
  | 'daily_completed'

export interface AchievementDefinition {
  type: AchievementType
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
}

export const ACHIEVEMENTS: Record<AchievementType, AchievementDefinition> = {
  first_win: {
    type: 'first_win',
    name: 'First Blood',
    description: 'Complete your first challenge',
    icon: '🎯',
    rarity: 'common',
    xpReward: 50
  },
  streak_3: {
    type: 'streak_3',
    name: 'On Fire',
    description: 'Win 3 challenges in a row',
    icon: '🔥',
    rarity: 'common',
    xpReward: 75
  },
  streak_5: {
    type: 'streak_5',
    name: 'Unstoppable',
    description: 'Win 5 challenges in a row',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 150
  },
  streak_10: {
    type: 'streak_10',
    name: 'Legendary',
    description: 'Win 10 challenges in a row',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 300
  },
  challenges_5: {
    type: 'challenges_5',
    name: 'Getting Started',
    description: 'Complete 5 challenges',
    icon: '📈',
    rarity: 'common',
    xpReward: 100
  },
  challenges_10: {
    type: 'challenges_10',
    name: 'Dedicated',
    description: 'Complete 10 challenges',
    icon: '💪',
    rarity: 'common',
    xpReward: 150
  },
  challenges_25: {
    type: 'challenges_25',
    name: 'Veteran',
    description: 'Complete 25 challenges',
    icon: '🎖️',
    rarity: 'rare',
    xpReward: 300
  },
  challenges_50: {
    type: 'challenges_50',
    name: 'Expert',
    description: 'Complete 50 challenges',
    icon: '⭐',
    rarity: 'epic',
    xpReward: 500
  },
  challenges_100: {
    type: 'challenges_100',
    name: 'Master',
    description: 'Complete 100 challenges',
    icon: '💎',
    rarity: 'legendary',
    xpReward: 750
  },
  level_10: {
    type: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '🌟',
    rarity: 'common',
    xpReward: 200
  },
  level_25: {
    type: 'level_25',
    name: 'Champion',
    description: 'Reach level 25',
    icon: '🏆',
    rarity: 'rare',
    xpReward: 400
  },
  level_50: {
    type: 'level_50',
    name: 'Legend',
    description: 'Reach level 50',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 1000
  },
  all_lanes: {
    type: 'all_lanes',
    name: 'Flex Master',
    description: 'Win a challenge in all 5 lanes',
    icon: '🎭',
    rarity: 'epic',
    xpReward: 500
  },
  off_meta: {
    type: 'off_meta',
    name: 'Meta Breaker',
    description: 'Win with an off-meta champion',
    icon: '🎪',
    rarity: 'rare',
    xpReward: 300
  },
  daily_completed: {
    type: 'daily_completed',
    name: 'Daily Grind',
    description: 'Complete a daily challenge',
    icon: '📅',
    rarity: 'common',
    xpReward: 100
  }
}

// Función para verificar si se debe otorgar un logro
export function checkAchievement(
  type: AchievementType,
  userStats: {
    currentStreak: number
    totalChallenges: number
    level: number
    lanesCompleted?: string[]
  }
): boolean {
  switch (type) {
    case 'first_win':
      return userStats.totalChallenges === 1
    case 'streak_3':
      return userStats.currentStreak === 3
    case 'streak_5':
      return userStats.currentStreak === 5
    case 'streak_10':
      return userStats.currentStreak === 10
    case 'challenges_5':
      return userStats.totalChallenges === 5
    case 'challenges_10':
      return userStats.totalChallenges === 10
    case 'challenges_25':
      return userStats.totalChallenges === 25
    case 'challenges_50':
      return userStats.totalChallenges === 50
    case 'challenges_100':
      return userStats.totalChallenges === 100
    case 'level_10':
      return userStats.level === 10
    case 'level_25':
      return userStats.level === 25
    case 'level_50':
      return userStats.level === 50
    case 'all_lanes':
      return userStats.lanesCompleted?.length === 5
    default:
      return false
  }
}

// Calcular nivel basado en XP
export function calculateLevel(xp: number): number {
  let level = 1
  let totalXp = 0

  while (xp >= totalXp + 100 * (level + 1)) {
    totalXp += 100 * (level + 1)
    level++
  }

  return level
}

// Calcular XP necesario para siguiente nivel
export function levelProgress(xp: number): number {
  const level = calculateLevel(xp)

  let totalXpBeforeLevel = 0
  for (let i = 1; i < level; i++) {
    totalXpBeforeLevel += 100 * (i + 1)
  }

  const xpIntoLevel = xp - totalXpBeforeLevel
  const xpNeeded = 100 * (level + 1)

  return Math.min(
    100,
    Math.floor((xpIntoLevel / xpNeeded) * 100)
  )
}