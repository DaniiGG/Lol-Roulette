"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { ChallengeSessionWithDefinition } from "@/lib/supabase"

interface ActiveChallengeDisplayProps {
  session: ChallengeSessionWithDefinition
  onComplete?: () => void
}

export default function ActiveChallengeDisplay({ session, onComplete }: ActiveChallengeDisplayProps) {
  const t = useTranslations('challenges')
  const [timeRemaining, setTimeRemaining] = useState<string>("--:--:--")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const expiresAt = new Date(session.expires_at)
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("00:00:00")
        setIsExpired(true)
        if (onComplete) onComplete()
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)
    return () => clearInterval(interval)
  }, [session.expires_at, onComplete])

  const progress = session.duration_hours > 0 
    ? Math.min(100, ((Date.now() - new Date(session.started_at).getTime()) / (session.duration_hours * 60 * 60 * 1000)) * 100)
    : 0

  const definition = session.definition
  const config = session.challenge_config

  let requirementText = ""
  if (session.challenge_type === "low_mastery") {
    const threshold = config.low_mastery?.mastery_threshold || 10000
    requirementText = t('requirement.lowMastery', { threshold: threshold.toLocaleString() }) || 
      `Play with a champion with less than ${threshold.toLocaleString()} mastery`
  } else if (session.challenge_type === "region") {
    const region = config.region?.region
    requirementText = t('requirement.region', { region }) || 
      `Win using a champion from ${region}`
  } else if (session.challenge_type === "class") {
    const className = config.class?.class
    requirementText = t('requirement.class', { class: className }) || 
      `Win using a ${className} champion`
  }

  return (
    <div className="relative rounded-2xl border-2 border-[#C89B3C]/50 bg-gradient-to-br from-[#C89B3C]/10 via-neutral-900/80 to-neutral-900/80 p-6">
      {/* Active Badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#C89B3C]/20">
            <span className="absolute h-2 w-2 rounded-full bg-[#C89B3C] animate-pulse" />
            <span className="relative z-10 text-[10px] font-bold text-[#C89B3C]">LIVE</span>
          </span>
          <span className="text-sm font-semibold text-[#C89B3C] uppercase tracking-wider">
            {t('activeChallenge') || 'ACTIVE CHALLENGE'}
          </span>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#C89B3C]/20 text-[#C89B3C]">
          {definition?.category || session.challenge_type}
        </span>
      </div>

      {/* Challenge Info */}
      <div className="mb-4 flex items-start gap-4">
        <span className="mt-1 text-4xl">{definition?.emoji || '🎯'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate">{definition?.name || 'Challenge'}</h3>
          <p className="mt-1 text-sm text-neutral-300">{definition?.description || ''}</p>
        </div>
      </div>

      {/* Requirement */}
      <div className="mb-4 rounded-lg bg-neutral-900/50 p-3 border border-neutral-800">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
          {t('requirement') || 'REQUIREMENT'}
        </p>
        <p className="text-sm text-white">{requirementText}</p>
      </div>

      {/* Stats Row */}
      <div className="mb-4 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl bg-neutral-900/50 p-3 border border-neutral-800">
          <p className="text-2xl font-bold text-[#C89B3C]">{session.valid_wins}</p>
          <p className="text-xs text-neutral-400">{t('validWins') || 'Valid Wins'}</p>
        </div>
        <div className="rounded-xl bg-neutral-900/50 p-3 border border-neutral-800">
          <p className="text-2xl font-bold text-green-400">+{session.bonus_xp}</p>
          <p className="text-xs text-neutral-400">{t('bonusXP') || 'Bonus XP'}</p>
        </div>
        <div className="rounded-xl bg-neutral-900/50 p-3 border border-neutral-800">
          <p className="text-2xl font-bold text-white">{session.total_base_xp + session.bonus_xp}</p>
          <p className="text-xs text-neutral-400">{t('totalXP') || 'Total XP'}</p>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            {t('timeRemaining') || 'TIME REMAINING'}
          </p>
          <span className="text-lg font-mono font-bold text-white tabular-nums">{timeRemaining}</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-[#C89B3C] to-[#d9aa44] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-neutral-500 text-right">
          {t('expiresAt', { time: new Date(session.expires_at).toLocaleTimeString() }) || 
            `Expires at ${new Date(session.expires_at).toLocaleTimeString()}`}
        </p>
      </div>

      {/* XP Multiplier Badge */}
      <div className="flex items-center justify-center gap-2 rounded-xl bg-[#C89B3C]/10 px-4 py-2 border border-[#C89B3C]/30">
        <span className="text-sm text-neutral-300">{t('xpMultiplierActive') || 'XP Multiplier Active:'}</span>
        <span className="text-xl font-black text-[#C89B3C]">x{session.xp_multiplier}</span>
        <span className="text-sm text-neutral-400">{t('onValidWins') || 'on valid wins'}</span>
      </div>

      {isExpired && (
        <div className="mt-4 rounded-xl bg-red-500/10 p-4 border border-red-500/30 text-center">
          <p className="text-red-400 font-semibold">{t('challengeExpired') || 'Challenge Expired'}</p>
          <p className="text-sm text-neutral-400 mt-1">{t('challengeExpiredDesc') || 'This challenge has expired. Start a new one to continue earning bonus XP.'}</p>
        </div>
      )}
    </div>
  )
}