"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { supabase } from "@/lib/supabase"
import { startChallengeSession, getChallengeSessions, validateChallengeMatch } from "@/lib/api-client"
import { CHALLENGE_DEFINITIONS, getChallengesByCategory, getAvailableChallenges, getDailyRegionChallenge } from "@/lib/challenge-definitions"
import ChallengeCard from "./ChallengeCard"
import ActiveChallengeDisplay from "./ActiveChallengeDisplay"
import ChallengeHistory from "./ChallengeHistory"
import { ChallengeSessionWithDefinition } from "@/lib/supabase"
import Cookies from "js-cookie"

export default function ChallengesSection({ user, sessionToken, locale }: { 
  user: any
  sessionToken: string | null
  locale: string
}) {
  const t = useTranslations('challenges')
  const [activeSession, setActiveSession] = useState<ChallengeSessionWithDefinition | null>(null)
  const [history, setHistory] = useState<ChallengeSessionWithDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    if (!user || !sessionToken) {
      setLoading(false)
      return
    }

    try {
      const data = await getChallengeSessions(sessionToken)
      setActiveSession(data.activeSession)
      setHistory(data.history || [])
    } catch (err: any) {
      console.error("Failed to load challenge sessions:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, sessionToken])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Set up realtime subscription for active session updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`challenge_sessions_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "challenge_sessions",
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Challenge session update:", payload)
          loadSessions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, loadSessions])

  const handleActivate = async (challengeId: string) => {
    if (!sessionToken || !user) {
      setError(t('loginRequired') || 'Please log in to activate challenges')
      return
    }

    setActivating(challengeId)
    setError(null)

    try {
      const result = await startChallengeSession(sessionToken, { challenge_id: challengeId })
      setSuccess(t('activated', { name: result.session.definition?.name || 'Challenge' }) || 'Challenge activated!')
      setActiveSession(result.session)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || t('activationFailed') || 'Failed to activate challenge')
    } finally {
      setActivating(null)
    }
  }

  const handleValidateMatch = async (matchData: any) => {
    if (!sessionToken || !activeSession) return

    try {
      const result = await validateChallengeMatch(sessionToken, matchData)
      if (result.success) {
        setActiveSession(result.session)
        // Update user XP in parent component via event
        window.dispatchEvent(new CustomEvent('challenge-xp-gained', { 
          detail: { xpGained: result.xpGained } 
        }))
      }
      return result
    } catch (err: any) {
      console.error("Match validation error:", err)
      throw err
    }
  }

  const availableChallenges = getAvailableChallenges()
  const categories = [
    { id: 'mastery', label: t('category.mastery') || 'Mastery', challenges: availableChallenges.filter(c => c.category === 'Mastery') },
    { id: 'region', label: t('category.region') || 'Region', challenges: availableChallenges.filter(c => c.category === 'Region') },
    { id: 'class', label: t('category.class') || 'Class', challenges: availableChallenges.filter(c => c.category === 'Class') }
  ]

  if (loading) {
    return (
      <section className="space-y-8" aria-labelledby="challenges-heading">
        <div className="flex items-center justify-between">
          <h2 id="challenges-heading" className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-[#C89B3C]">🎯</span>
            {t('sectionTitle') || 'Challenges'}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 animate-pulse">
              <div className="h-10 w-1/3 bg-neutral-800 rounded mb-4" />
              <div className="h-6 w-full bg-neutral-800 rounded mb-2" />
              <div className="h-4 w-3/4 bg-neutral-800 rounded mb-4" />
              <div className="h-4 w-1/2 bg-neutral-800 rounded mb-2" />
              <div className="h-4 w-1/2 bg-neutral-800 rounded mb-4" />
              <div className="h-10 w-full bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  const dailyRegion = getDailyRegionChallenge()

  return (
    <section className="space-y-8" aria-labelledby="challenges-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 id="challenges-heading" className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-[#C89B3C]">🎯</span>
          {t('sectionTitle') || 'Challenges'}
        </h2>
        <p className="text-sm text-neutral-400">
          {t('sectionDescription') || 'Activate time-limited challenges to earn bonus XP on victories'}
        </p>
      </div>

      {/* Daily Region Banner */}
      <div className="rounded-2xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <div>
            <p className="text-xs font-semibold text-[#C89B3C] uppercase tracking-wider">{t('dailyRegion') || 'Región del Día'}</p>
            <p className="text-lg font-bold text-white">{dailyRegion}</p>
          </div>
        </div>
        <p className="text-sm text-neutral-400 mt-2">
          {t('dailyRegionDesc') || 'Only this region challenge is available today. Changes at midnight UTC.'}
        </p>
      </div>

      {/* Active Challenge Display */}
      {activeSession && (
        <ActiveChallengeDisplay 
          session={activeSession}
          onComplete={loadSessions}
        />
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/30 flex items-center justify-between">
          <p className="text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/30 flex items-center justify-between animate-slideIn">
          <p className="text-green-400">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">✕</button>
        </div>
      )}

      {/* Available Challenges */}
      <div className="space-y-8">
        {categories.map((category) => (
          category.challenges.length > 0 && (
            <div key={category.id} className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-[#C89B3C]">◆</span>
                {category.label}
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onActivate={handleActivate}
                    disabled={activating === challenge.id}
                    hasActiveChallenge={!!activeSession}
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Challenge History */}
      {history.length > 0 && (
        <div className="pt-8 border-t border-neutral-800">
          <ChallengeHistory sessions={history} locale={locale} />
        </div>
      )}
    </section>
  )
}