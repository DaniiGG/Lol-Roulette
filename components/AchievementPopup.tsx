// components/AchievementPopup.tsx
'use client'

import { useTranslations } from 'next-intl'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { useEffect } from 'react'

interface AchievementPopupProps {
  achievementTypes: string[]
  onClose?: () => void
}

export default function AchievementPopup({ achievementTypes, onClose }: AchievementPopupProps) {
  const t = useTranslations('achievements')

  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [onClose])

  if (achievementTypes.length === 0) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 md:p-8 rounded-3xl border-4 border-yellow-300 shadow-2xl pointer-events-auto animate-bounce-in max-w-md w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          {t('newAchievement')}
        </h2>
        
        <div className="space-y-4">
          {achievementTypes.map(type => {
            const achievement = ACHIEVEMENTS[type as keyof typeof ACHIEVEMENTS]
            return (
              <div key={type} className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-5xl md:text-6xl mb-2">{achievement.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {achievement.name}
                </h3>
                <p className="text-white/90 text-sm mb-2">
                  {achievement.description}
                </p>
                <div className="inline-block px-4 py-2 bg-yellow-400/30 rounded-full">
                  <p className="text-yellow-100 font-bold">
                    {t('xpReward', { xp: achievement.xpReward })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition"
          >
            {t('close')}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  )
}
