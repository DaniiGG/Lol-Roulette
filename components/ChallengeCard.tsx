"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { ChallengeDefinition, getChallengeById } from "@/lib/challenge-definitions"

interface ChallengeCardProps {
  challenge: ChallengeDefinition
  onActivate: (challengeId: string, duration: number) => void
  disabled?: boolean
  hasActiveChallenge?: boolean
}

export default function ChallengeCard({ challenge, onActivate, disabled = false, hasActiveChallenge = false }: ChallengeCardProps) {
  const t = useTranslations('challenges')
  const [selectedDuration, setSelectedDuration] = useState(challenge.defaultDuration)

  const handleActivate = () => {
    if (disabled || hasActiveChallenge) return
    onActivate(challenge.id, selectedDuration)
  }

  return (
    <article className="relative rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 transition hover:border-[#C89B3C]/40 group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{challenge.emoji}</span>
        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#C89B3C]/20 text-[#C89B3C]">
          {t(`difficulty.${challenge.defaultDuration === 5 ? 'hard' : 'medium'}`) || 'Medium'}
        </span>
      </div>
      
      <h3 className="mb-2 text-xl font-semibold text-white">{challenge.name}</h3>
      <p className="mb-4 leading-6 text-neutral-300 text-sm">{challenge.description}</p>

      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">{t('duration') || 'Duration'}</span>
          <div className="flex gap-2">
            {challenge.availableDurations.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                disabled={disabled || hasActiveChallenge}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedDuration === duration
                    ? 'bg-[#C89B3C] text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                } disabled:opacity-50`}
              >
                {duration}h
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">{t('xpMultiplier') || 'XP Multiplier'}</span>
          <span className="font-bold text-[#C89B3C]">x{challenge.xpMultiplier}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">{t('category') || 'Category'}</span>
          <span className="font-medium text-neutral-200">{t(`category.${challenge.category.toLowerCase()}`) || challenge.category}</span>
        </div>
      </div>

      <button
        onClick={handleActivate}
        disabled={disabled || hasActiveChallenge}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
          disabled || hasActiveChallenge
            ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
            : 'bg-[#C89B3C] text-neutral-950 hover:bg-[#d9aa44]'
        }`}
      >
        {hasActiveChallenge 
          ? (t('hasActiveChallenge') || 'Active Challenge Exists')
          : (t('activate') || 'Activate')}
      </button>
    </article>
  )
}