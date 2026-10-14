"use client"

import { useTranslations } from "next-intl"
import { ChallengeDefinition } from "@/lib/challenge-definitions"

interface ChallengeCardProps {
  challenge: ChallengeDefinition
  onActivate: (challengeId: string) => void
  disabled?: boolean
  hasActiveChallenge?: boolean
}

export default function ChallengeCard({ challenge, onActivate, disabled = false, hasActiveChallenge = false }: ChallengeCardProps) {
  const t = useTranslations('challenges')

  const handleActivate = () => {
    if (disabled || hasActiveChallenge) return
    onActivate(challenge.id)
  }

  return (
    <article className="relative rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 transition hover:border-[#C89B3C]/40 group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{challenge.emoji}</span>
        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#C89B3C]/20 text-[#C89B3C]">
          {t('durationShort') || '3h'}
        </span>
      </div>
      
      <h3 className="mb-2 text-xl font-semibold text-white">{challenge.name}</h3>
      <p className="mb-4 leading-6 text-neutral-300 text-sm">{challenge.description}</p>

      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">{t('xpMultiplier') || 'XP Multiplier'}</span>
          <span className="font-bold text-[#C89B3C]">x{challenge.xpMultiplier}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">{t('categoryLabel') || 'Category'}</span>
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