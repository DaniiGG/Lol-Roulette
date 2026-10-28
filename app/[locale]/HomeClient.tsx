"use client"

import { useState, useEffect, useRef, useSyncExternalStore } from "react"
import { resolveLegacyPostHref } from "@/lib/blog/meta"
import { useTranslations, useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ACHIEVEMENTS, checkAchievement, calculateLevel } from "@/lib/achievements"
import {
  createChallenge, rerollChallenge, completeChallengeById, failChallenge,
  resetStreak, validateChallengeMatch
} from "@/lib/api-client"
import confetti from "canvas-confetti"
import Cookies from 'js-cookie'
import { History, Trash2 } from 'lucide-react'
import InfoModal from "@/components/InfoModal"

// Components
import LaneSelector from "@/components/LaneSelector"
import ChampionCard from "@/components/ChampionCard"
import UserStats from "@/components/UserStats"
import AchievementsList from "@/components/AchievementsList"
import AchievementPopup from "@/components/AchievementPopup"
import VerificationResult from "@/components/VerificationResult"
import AutoVerifyIndicator from "@/components/AutoVerifyIndicator"
import RouletteWheel from "@/components/RouletteWheel"
import SlotMachineRoulette from "@/components/Slotmachineroulette"
import SEOContent from "@/components/SEOContent"
import ChampionStats from "@/components/ChampionStats"
import MatchSimulator from "@/components/MatchSimulator"
import { AutoVerifier } from "@/lib/auto-verify"
import RSOLoginModal from "@/components/RSOLoginmodal"
import ChampionPoolModal from "@/components/ChampionPoolModal"
import Toast from "@/components/Toast"
import { loadChampionPool, getPoolForLane, type ChampionPool } from "@/lib/champion-pool"
import { getChallengesByType } from "@/lib/challenge-definitions"

import Script from "next/script"

type GuestPick = {
  id: string
  name: string
  lane: string
  createdAt: string
}

const GUEST_PICK_STORAGE_KEY = 'league-roulette-guest-picks'
const GUEST_PICK_CHANGE_EVENT = 'league-roulette-guest-picks-changed'
const MAX_GUEST_PICKS = 6
let guestPicksMemorySnapshot = '[]'
const GUEST_PICK_LANE_LABELS: Record<string, string> = {
  all: 'allLanes',
  top: 'top',
  jungle: 'jungle',
  mid: 'mid',
  adc: 'adc',
  support: 'support',
  aram: 'islandLife'
}

function subscribeToGuestPicks(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === GUEST_PICK_STORAGE_KEY) onStoreChange()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(GUEST_PICK_CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(GUEST_PICK_CHANGE_EVENT, onStoreChange)
  }
}

function getGuestPicksSnapshot() {
  try {
    const storedPicks = localStorage.getItem(GUEST_PICK_STORAGE_KEY)
    if (storedPicks !== null) {
      guestPicksMemorySnapshot = storedPicks
      return storedPicks
    }
  } catch {
    return guestPicksMemorySnapshot
  }
  return guestPicksMemorySnapshot
}

function parseGuestPicks(snapshot: string): GuestPick[] {
  try {
    const picks = JSON.parse(snapshot)
    if (!Array.isArray(picks)) return []
    return picks.filter((pick): pick is GuestPick =>
      typeof pick?.id === 'string' &&
      typeof pick?.name === 'string' &&
      typeof pick?.lane === 'string' &&
      typeof pick?.createdAt === 'string'
    ).slice(0, MAX_GUEST_PICKS)
  } catch {
    return []
  }
}

function saveGuestPicks(picks: GuestPick[]) {
  guestPicksMemorySnapshot = JSON.stringify(picks)
  try {
    localStorage.setItem(GUEST_PICK_STORAGE_KEY, guestPicksMemorySnapshot)
  } catch {
    guestPicksMemorySnapshot = JSON.stringify(picks)
  }
  window.dispatchEvent(new Event(GUEST_PICK_CHANGE_EVENT))
}

export default function Home() {
  const t = useTranslations('home')
  const tChallenges = useTranslations('challenges')
  const tLanes = useTranslations('laneSelector')
  const locale = useLocale()
  const guestPicks = parseGuestPicks(useSyncExternalStore(
    subscribeToGuestPicks,
    getGuestPicksSnapshot,
    () => '[]'
  ))
  const searchParams = useSearchParams()
  const urlChallenge = searchParams.get('challenge')

  // User state
  const [user, setUser] = useState<any>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)

  // Challenge state
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(urlChallenge || null)
  const [challengeLane, setChallengeLane] = useState<string>('all')
  const [activeChallengeSession, setActiveChallengeSession] = useState<any>(null)
  const activeChallengeType = activeChallengeSession?.challenge_type
  const activeChallengeDefinition = activeChallengeSession
    ? getChallengesByType(activeChallengeType).find((definition) =>
        JSON.stringify(definition.config) === JSON.stringify(activeChallengeSession.challenge_config)
      )
    : null
  const activeChallengeTitle = activeChallengeSession?.definition?.name || activeChallengeDefinition?.name || (
    activeChallengeType === 'region' ? tChallenges('category.region') :
      activeChallengeType === 'class' ? tChallenges('category.class') :
        activeChallengeType === 'low_mastery' ? tChallenges('category.mastery') :
          t('challengeActive')
  )
  const activeChallengeRequirement = activeChallengeType === 'region'
    ? tChallenges('requirement.region', { region: activeChallengeSession.challenge_config.region?.region || '' })
    : activeChallengeType === 'class'
      ? tChallenges('requirement.class', { class: activeChallengeSession.challenge_config.class?.class || '' })
      : activeChallengeType === 'low_mastery'
        ? tChallenges('requirement.lowMastery', { threshold: (activeChallengeSession.challenge_config.low_mastery?.mastery_threshold || 10000).toLocaleString(locale) })
        : null

  // Roulette state (PÚBLICO - no requiere login)
  const [champ, setChamp] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [selectedLane, setSelectedLane] = useState('all')
  const [showPoolModal, setShowPoolModal] = useState(false)
  const [usePool, setUsePool] = useState(false)
  const [championPool, setChampionPool] = useState<ChampionPool | null>(null)
  const [poolEnabled, setPoolEnabled] = useState(false)
  const activePoolChamps = usePool && championPool ? getPoolForLane(championPool, selectedLane) : null

  // Premium features (requieren login)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [userAchievements, setUserAchievements] = useState<string[]>([])

   // Active challenge tracking (para evitar spins infinitos)
   const activeChallengeRef = useRef<any>(null)
   const [rerollCount, setRerollCount] = useState(0)  // Track rerolls (unlimited for now)
   const MAX_REROLLS = Infinity  // Unlimited spins

  // Info modal
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Toast announcement for challenges update
  const [showChallengesToast, setShowChallengesToast] = useState(true)

// Auto-verification
   const [autoVerifier, setAutoVerifier] = useState<AutoVerifier | null>(null)
   const [isAutoVerifying, setIsAutoVerifying] = useState(false)
   const [showSimulator, setShowSimulator] = useState(false)

  // Cargar champion pool de localStorage al iniciar
  useEffect(() => {
    const saved = loadChampionPool()
    if (Object.keys(saved).length > 0) {
      setChampionPool(saved)
    }

  }, [])

  const clearGuestPicks = () => {
    guestPicksMemorySnapshot = '[]'
    try {
      localStorage.removeItem(GUEST_PICK_STORAGE_KEY)
    } catch {
      window.dispatchEvent(new Event(GUEST_PICK_CHANGE_EVENT))
      return
    }
    window.dispatchEvent(new Event(GUEST_PICK_CHANGE_EVENT))
  }

  // Challenge lane mapping
  const getLaneForChallenge = (challengeId: string): string => {
    const laneMap: Record<string, string> = {
      'support-only': 'support',
      'aram-only': 'aram',
    }
    return laneMap[challengeId] || 'all'
  }

  // Update challenge lane when challenge changes
  useEffect(() => {
    if (urlChallenge) {
      setActiveChallengeId(urlChallenge)
      setChallengeLane(getLaneForChallenge(urlChallenge))
      setSelectedLane(getLaneForChallenge(urlChallenge))
    } else {
      setActiveChallengeId(null)
      setChallengeLane('all')
    }
  }, [urlChallenge])

  // Verificar sesión al cargar
  useEffect(() => {
    const token = Cookies.get('session_token')
    if (token) {
      void verifyAndLoadSession(token).finally(() => setProfileLoading(false))
    } else {
      setProfileLoading(false)
    }
  }, [])

  const verifyAndLoadSession = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        Cookies.remove('session_token')
        return
      }

      const { user: userData } = await response.json()
      setUser(userData)
      setSessionToken(token)
      await loadUserData(userData.id)

    } catch (error) {
      Cookies.remove('session_token')
    }
  }

  const loadUserData = async (userId: string) => {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (userData) setUser(userData)
    const { data: achievements } = await supabase
      .from('achievements')
      .select('achievement_type')
      .eq('user_id', userId)
    if (achievements) {
      setUserAchievements(achievements.map(a => a.achievement_type))
    }
    // Cargar challenge session activo (nuevo sistema de desafíos)
    const { data: activeSession } = await supabase
      .from('challenge_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (activeSession) {
      setActiveChallengeSession(activeSession)
    }
    // Cargar challenge activo (sistema antiguo - para compatibilidad)
    const { data: pendingChallenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (challengeError) {
      console.error('❌ Error loading challenge:', challengeError)
    }
    if (pendingChallenge) {
      activeChallengeRef.current = pendingChallenge
      setActiveChallengeId(pendingChallenge.id)
      setChamp({
        id: pendingChallenge.champion_name,
        key: Number(pendingChallenge.champion_id),
        name: pendingChallenge.champion_name,
        lane: pendingChallenge.lane
      })
    }
  }

  // Mostrar toast de anuncio de challenges (solo una vez por sesión)
  useEffect(() => {
    if (showChallengesToast) {
      const hasSeenToast = sessionStorage.getItem('challengesToastAnnouncementShown')
      if (!hasSeenToast) {
        const timer = setTimeout(() => {
          setShowChallengesToast(false)
          sessionStorage.setItem('challengesToastAnnouncementShown', 'true')
        }, 15000) // Auto-hide after 15s
        return () => clearTimeout(timer)
      } else {
        setShowChallengesToast(false)
      }
    }
  }, [showChallengesToast])

  // SPIN: llamado por RouletteWheel al terminar la animación
  const handleRouletteResult = async (champData: { id: string; key: string | number; name: string }) => {
    setVerificationResult(null)

    if (!user) {
      const nextPicks = [{
        id: champData.id,
        name: champData.name,
        lane: selectedLane,
        createdAt: new Date().toISOString()
      }, ...guestPicks].slice(0, MAX_GUEST_PICKS)
      saveGuestPicks(nextPicks)
    }

    // Incrementar reroll count
    const newRerollCount = user ? rerollCount + 1 : 0
    setRerollCount(newRerollCount)
    if (user) {
      console.log(`🎲 Spin #${newRerollCount} of ${MAX_REROLLS + 1}`)
      console.log(`🎯 Champion: ${champData.name} (key: ${champData.key})`)
    }


    try {
      // Guardar/actualizar challenge SOLO si está logueado
      if (user) {
        // Si ya existe un challenge pendiente, actualizarlo
        if (activeChallengeRef.current) {
          const { challenge: updatedChallenge } = await rerollChallenge(sessionToken!, {
            challenge_id: activeChallengeRef.current.id,
            champion_id: String(champData.key),
            champion_name: champData.name,
            lane: selectedLane,
            reroll_count: newRerollCount
          })

          activeChallengeRef.current = updatedChallenge
          setActiveChallengeId(updatedChallenge.id)

          // Reiniciar auto-verificación
          if (sessionToken) {
            stopAutoVerification()
            startAutoVerification(champData, updatedChallenge.created_at)
          }
        } else {
          // Crear challenge nuevo
          const { challenge: newChallenge } = await createChallenge(sessionToken!, {
            champion_id: String(champData.key),
            champion_name: champData.name,
            lane: selectedLane,
            reroll_count: newRerollCount
          })

          activeChallengeRef.current = newChallenge
          setActiveChallengeId(newChallenge.id)

          // Iniciar auto-verificación
          if (sessionToken && newChallenge) {
            startAutoVerification(champData, newChallenge.created_at)
          }
        }
      }

      setChamp({
        ...champData,
        key: Number(champData.key)
      })
    } catch (error) {
      console.error('❌ Error saving challenge:', error)
    }
  }

  // Iniciar auto-verificación
  const startAutoVerification = (champion: any, challengeCreatedAt: string) => {
    if (!user || !sessionToken) return

    console.log('🚀 Starting auto-verification for', champion.name)
    console.log('Challenge created at:', challengeCreatedAt)

    const verifier = new AutoVerifier(
      user.id,
      user.puuid,
      user.region,
      champion.key,
      challengeCreatedAt,
      async (result) => {
        // Success callback
        console.log('✅ Auto-verification succeeded!', result)
        setVerificationResult(result)
        setIsAutoVerifying(false)
        await handleVictory(result)
      },
      async (result) => {
        // Fail callback
        console.log('❌ Auto-verification failed')
        setVerificationResult(result)
        setIsAutoVerifying(false)
        await handleFailure(result)
      },
      sessionToken
    )

    verifier.start()
    setAutoVerifier(verifier)
    setIsAutoVerifying(true)
  }

  // Detener auto-verificación
  const stopAutoVerification = () => {
    if (autoVerifier) {
      autoVerifier.stop()
      setAutoVerifier(null)
      setIsAutoVerifying(false)
      console.log('⏹️ Auto-verification stopped')
    }
  }

  // Verificación manual (también detiene auto-verificación)
  const handleManualVerify = () => {
    stopAutoVerification()
    verifyMatch()
  }

  const verifyMatch = async () => {
    if (!user || !champ || !sessionToken) return

    setVerifying(true)
    const challengeStartDates = [activeChallengeSession?.started_at, activeChallengeRef.current?.created_at]
      .filter((date): date is string => typeof date === 'string')
      .sort((first, second) => Date.parse(first) - Date.parse(second))
    const challengeCreatedAt = challengeStartDates[challengeStartDates.length - 1]

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          puuid: user.puuid,
          region: user.region,
          championId: champ.key,
          challengeCreatedAt
        })
      })

      if (!res.ok) {
        if (res.status === 401) {
          alert('Session expired. Please login again.')
          handleLogout()
          return
        }
        throw new Error('Verification failed')
      }

      const result = await res.json()
      setVerificationResult(result)

      if (result.pending) {
        return
      }

      if (result.success) {
        await handleVictory(result)
      } else {
        await handleFailure(result)
      }

      // Limpiar active challenge
      setActiveChallengeId(null)
      activeChallengeRef.current = null

    } catch (error) {
      console.error('Verification error:', error)
      alert('Error verifying match.')
    } finally {
      setVerifying(false)
    }
  }

  const handleVictory = async (matchData: any) => {
    if (!user || !sessionToken || (!activeChallengeRef.current && !activeChallengeSession)) return

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })

    let normalXpAwarded = false
    if (activeChallengeRef.current) {
      try {
        const result = await completeChallengeById(sessionToken, {
          challenge_id: activeChallengeRef.current.id,
          match_id: matchData.matchId
        })

        setUser(result.user)
        normalXpAwarded = result.success === true

        const unlockedTypes = (result.achievements || []).map((achievement: any) => achievement.achievement_type)
        if (unlockedTypes.length > 0) {
          setNewAchievements(unlockedTypes)
          setUserAchievements([...userAchievements, ...unlockedTypes])
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } })
        }
      } catch (error) {
        console.error('❌ Error completing roulette challenge:', error)
      }

      setRerollCount(0)
      activeChallengeRef.current = null
      setActiveChallengeId(null)
    }

    if (activeChallengeSession) {
      try {
        const challengeResult = await validateChallengeMatch(sessionToken, {
          match_id: matchData.matchId,
          champion_name: matchData.championPlayed,
          champion_id: matchData.championIdPlayed,
          won: matchData.won,
          game_mode: matchData.gameMode,
          game_duration: matchData.gameDuration,
          stats: matchData.stats,
          game_end_timestamp: matchData.gameEndTimestamp,
          base_xp_already_awarded: normalXpAwarded
        })

        if (challengeResult.success) {
          setActiveChallengeSession(challengeResult.session)
          if (challengeResult.xpGained?.total) {
            window.dispatchEvent(new CustomEvent('challenge-xp-gained', {
              detail: { xpGained: challengeResult.xpGained }
            }))
          }
          setVerificationResult((previous: any) => previous
            ? { ...previous, challengeBonusXp: challengeResult.xpGained?.bonus || 0 }
            : previous)
        } else {
          console.info('Verified match did not meet the active challenge requirements:', challengeResult.message)
        }
      } catch (error) {
        console.error('❌ Error validating active challenge match:', error)
      }
    }
  }

  const handleFailure = async (matchData: any) => {
    if (!user) return
    if (activeChallengeRef.current) {
      try {
        await failChallenge(sessionToken!, {
          challenge_id: activeChallengeRef.current.id,
          match_id: matchData.matchId,
          match_data: matchData.stats
        })
      } catch (error) {
        console.error('❌ Error failing challenge:', error)
      }
    }
    try {
      await resetStreak(sessionToken!)
    } catch (error) {
      console.error('❌ Error resetting streak:', error)
    }
    const updatedUser = { ...user, current_streak: 0 }
    setUser(updatedUser)
    setRerollCount(0)
    activeChallengeRef.current = null
    setActiveChallengeId(null)
  }

  // Listen for challenge XP gains from ChallengesSection
  useEffect(() => {
    const handleChallengeXpGained = (event: CustomEvent) => {
      const { xpGained } = event.detail
      if (xpGained) {
        setUser((prev: any) => {
          if (!prev) return null
          const newXp = (prev.xp || 0) + xpGained.total
          return { ...prev, xp: newXp, level: calculateLevel(newXp) }
        })
        console.log(`🎁 Challenge XP gained: +${xpGained.total} (base: ${xpGained.base}, bonus: ${xpGained.bonus})`)
      }
    }

    window.addEventListener('challenge-xp-gained', handleChallengeXpGained as EventListener)
    return () => window.removeEventListener('challenge-xp-gained', handleChallengeXpGained as EventListener)
  }, [])

  const checkAndUnlockAchievements = async (stats: any) => {
    if (!user) return

    const newlyUnlocked: string[] = []

    for (const [type, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (userAchievements.includes(type)) continue

      if (checkAchievement(type as any, stats)) {
        try {
        } catch (error) {
          console.error('❌ Error unlocking achievement:', error)
        }

        newlyUnlocked.push(type)
      }
    }

    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked)
      setUserAchievements([...userAchievements, ...newlyUnlocked])
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } })
    }
  }

  const handleLogout = () => {
    if (sessionToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        }
      })
    }

    // Detener auto-verificación
    stopAutoVerification()

    Cookies.remove('session_token')
    setUser(null)
    setSessionToken(null)
    setVerificationResult(null)
    setRerollCount(0)  // Reset rerolls on logout
    setActiveChallengeId(null)
    activeChallengeRef.current = null
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">

      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-600/10 rounded-full blur-3xl"></div>
      </div>

{/*<h6 className="w-100% bg-red-500 text-white text-center py-2">LOGIN IS CURRENTLY DISABLED</h6>*/}
      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">

        <div className="max-w-7xl mx-auto">

          {/* User Stats (solo si está logueado) */}
          {user && (
            <div className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <UserStats user={{
                  summoner_name: `${user.game_name}#${user.tag_line}`,
                  level: user.level,
                  xp: user.xp,
                  summoner_level: user.summoner_level,
                  profile_icon_id: user.profile_icon_id,
                  current_streak: user.current_streak,
                  longest_streak: user.longest_streak,
                  total_challenges_completed: user.total_challenges_completed
                }} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAchievementsModal(true)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition text-sm"
                >
                  🏆{t('achievements')} <span className="text-neutral-400 text-sm">
                    {userAchievements.length}/{Object.keys(ACHIEVEMENTS).length}🏆
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition text-sm"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className={`max-w-4xl mx-auto space-y-3`}>
            {/* Left: Roulette (SIEMPRE VISIBLE) */}
            <div className={`${user ? 'lg:col-span-2' : 'max-w-2xl mx-auto w-full'} space-y-6`}>
              {/* HEADER */}
              <div className="text-center relative">
                <h1 className="mb-2 relative">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="h-px w-5 bg-gradient-to-r from-transparent via-[#C89B3C]/40 to-transparent"></span>
                    <span className="text-[10px] md:text-xs tracking-[0.35em] text-[#C89B3C]">✦ {t('heroTitle1')} ✦</span>
                    <span className="h-px w-5 bg-gradient-to-r from-transparent via-[#C89B3C]/40 to-transparent"></span>
                  </div>
                  <div className="flex items-baseline justify-center gap-2 sm:gap-3 flex-wrap">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-white leading-none">
                      {t('heroTitle2')}
                    </div>
                    <div className="relative inline-block">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#00e5ff] leading-[1.1]">
                        {t('heroTitle3')}
                      </div>
                    </div>
                  </div>
                </h1>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C89B3C]/10 via-[#C89B3C]/5 to-transparent px-4 py-1.5 rounded-full border border-[#C89B3C]/20 mb-3">
                  {t.raw('tags').map((tag: string, i: number) => (
                    <span key={tag} className={`text-[10px] md:text-xs font-semibold ${i === 0 ? 'text-[#C89B3C]' : i === 1 ? 'text-[#00e5ff]' : i === 2 ? 'text-neutral-500' : 'text-[#C89B3C]/70'}`}>
                      {i > 0 && <span className="mx-1 text-neutral-600">◆</span>}{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Challenge Active Banner */}
              {(activeChallengeId || activeChallengeSession) && (
                <div className="mx-auto mb-4 flex max-w-4xl flex-col gap-2 rounded-xl border border-[#C89B3C]/40 bg-[#C89B3C]/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 text-[#C89B3C]" aria-hidden="true">⚡</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C89B3C]">
                        {tChallenges('activeChallenge')}
                      </p>
                      <p className="truncate text-sm font-semibold text-white">{activeChallengeTitle}</p>
                      {activeChallengeRequirement ? (
                        <p className="truncate text-xs text-neutral-400">{activeChallengeRequirement}</p>
                      ) : challengeLane !== 'all' ? (
                        <p className="text-xs text-neutral-400">{t('lane')}: {challengeLane}</p>
                      ) : null}
                    </div>
                  </div>
                  {activeChallengeSession && (
                    <div className="shrink-0 text-xs text-neutral-400 sm:text-right">
                      <p>{activeChallengeSession.valid_wins} {tChallenges('validWins')} · +{activeChallengeSession.bonus_xp} {tChallenges('bonusXP')}</p>
                      <p>x{activeChallengeSession.xp_multiplier} {tChallenges('xpMultiplier')} · {tChallenges('expiresAt', { time: new Date(activeChallengeSession.expires_at).toLocaleTimeString(locale) })}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lane Selector */}
              <LaneSelector
                selectedLane={selectedLane}
                onLaneChange={setSelectedLane}
                disabled={!!activeChallengeId || !!activeChallengeSession || !!(user && rerollCount > MAX_REROLLS)}
              />

              {/* Champion Pool Toggle */}
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  onClick={() => { setShowPoolModal(true); setChampionPool(loadChampionPool()) }}
                  className="text-xs text-neutral-500 hover:text-[#C89B3C] transition underline underline-offset-2"
                >
                  {t('editPool')}
                </button>
                {championPool && Object.keys(championPool).length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={usePool}
                        onChange={(e) => setUsePool(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 rounded-full bg-neutral-700 peer-checked:bg-[#C89B3C]/50 transition-colors" />
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-neutral-400 transition-all ${usePool ? 'translate-x-4 bg-[#C89B3C]' : ''}`} />
                    </div>
                    <span className="text-xs text-neutral-500">{t('usePool')}</span>
                  </label>
                )}
              </div>

              {/* ★ RULETA VISUAL ★ */}
              <RouletteWheel
                lane={selectedLane}
                onResult={handleRouletteResult}
                disabled={!!(user && rerollCount > MAX_REROLLS)}
                profileLoading={profileLoading}
                rerollsUsed={user ? rerollCount : 0}
                maxRerolls={MAX_REROLLS}
                championPool={activePoolChamps}
                challengeFilter={activeChallengeSession ? {
                  type: activeChallengeSession.challenge_type,
                  value: activeChallengeSession.challenge_type === 'region' 
                    ? activeChallengeSession.challenge_config.region?.region
                    : activeChallengeSession.challenge_type === 'class'
                      ? activeChallengeSession.challenge_config.class?.class
                      : activeChallengeSession.challenge_config.low_mastery?.mastery_threshold
                } : null}
              />

              {!user && (
                <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5" aria-labelledby="guest-picks-heading">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 id="guest-picks-heading" className="flex items-center gap-2 font-semibold text-white">
                      <History className="h-4 w-4 text-[#C89B3C]" />
                      {t('guestHistoryTitle')}
                    </h2>
                    {guestPicks.length > 0 && (
                      <button
                        type="button"
                        onClick={clearGuestPicks}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('clearGuestHistory')}
                      </button>
                    )}
                  </div>
                  {guestPicks.length > 0 ? (
                    <ul className="flex gap-2 overflow-x-auto pb-2">
                      {guestPicks.map((pick) => (
                        <li key={pick.createdAt} className="shrink-0 rounded-xl border border-neutral-800 bg-neutral-950/50 p-1">
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/16.21.1/img/champion/${pick.id}.png`}
                            alt={pick.name}
                            className="w-10 h-10 object-cover rounded-lg"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-neutral-500">{t('guestHistoryEmpty')}</p>
                  )}
                </section>
              )}

              {/* Champion Stats & Build */}
              {champ && (
                <ChampionStats championId={champ.id} championName={champ.name} />
              )}

              {/* Verify button (solo si logueado, hay campeón y no está auto-verificando) */}
              {user && champ && !verificationResult && !isAutoVerifying && (
                <button
                  onClick={handleManualVerify}
                  disabled={verifying}
                  className="w-full py-4 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {t('matchMaking.verifying')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('matchMaking.verify')}
                    </>
                  )}
                </button>
              )}


{/* Auto-Verification Indicator */}
               {isAutoVerifying && champ && user && (
                 <AutoVerifyIndicator
                   isActive={isAutoVerifying}
                   championName={champ.name}
                   onManualVerify={handleManualVerify}
                   onCancel={stopAutoVerification}
                 />
               )}

{/* Match Simulator Toggle - Solo desarrollo */}
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <button
                      onClick={() => setShowSimulator(!showSimulator)}
                      className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">🧪</span>
                      {showSimulator ? 'Hide' : 'Show'} Match Simulator
                    </button>

                    {/* Match Simulator */}
                    {showSimulator && (
                      <div className="mt-4">
                        <MatchSimulator />
                      </div>
                    )}
                  </>
                )}

               {/* CTA para login (solo si no está logueado y ya giró) */}
              {!user && champ && (
                <div className="flex flex-col gap-3 border-t border-neutral-800 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{t('trackProgress')}</h3>
                    <p className="mt-1 text-sm text-neutral-400">{t('trackProgressDesc')}</p>
                  </div>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="shrink-0 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
                  >
                    {t('loginWithRiot')}
                  </button>
                </div>
              )}

              {/* Verification Result */}
              {verificationResult && champ && user && (
                <VerificationResult
                  result={verificationResult}
                  championName={champ.name}
                />
              )}
            </div>
          </div>

          {/* SEO Rich Content */}
          <SEOContent />

          <section className="mx-auto mt-16 max-w-5xl">
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">
                {t('guidesSection')}
              </p>
              <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">
                {t('guidesTitle')}
              </h2>
              <p className="mx-auto max-w-3xl text-lg leading-8 text-neutral-400">
                {t('guidesDesc')}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {t.raw('blogPosts').map((post: { href: string; title: string; desc: string }, i: number) => (
                <a
                  key={post.href}
                  href={resolveLegacyPostHref(post.href, locale)}
                  className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 transition hover:border-[#C89B3C]/40 hover:bg-neutral-900"
                >
                  <h3 className="mb-3 text-2xl font-semibold text-white">
                    {post.title}
                  </h3>
                  <p className="leading-7 text-neutral-400">
                    {post.desc}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}

      {/* Champion Pool Modal */}
      {showPoolModal && (
        <ChampionPoolModal
          onClose={() => setShowPoolModal(false)}
          onSave={(pool) => {
            setChampionPool(pool)
            if (Object.keys(pool).length > 0) setUsePool(true)
          }}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <RSOLoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(token, user) => {
            setSessionToken(token)
            setUser(user)
            setShowLoginModal(false)
            if (user?.id) loadUserData(user.id)
          }}
        />
      )}

      {/* Achievement Popup */}
      {user && (
        <AchievementPopup
          achievementTypes={newAchievements}
          onClose={() => setNewAchievements([])}
        />
      )}

      {showAchievementsModal && user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 max-w-3xl w-full max-h-[90vh] overflow-hidden">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{t('achievements')}</h2>
              <button
                onClick={() => setShowAchievementsModal(false)}
                className="text-neutral-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <AchievementsList
              unlockedAchievements={userAchievements}
              newAchievements={newAchievements}
            />
          </div>
        </div>
      )}

      {/* Challenges Update Toast */}
      {showChallengesToast && (
        <Toast 
          message={tChallenges('toastAnnouncement')} 
          onClose={() => { setShowChallengesToast(false); sessionStorage.setItem('challengesToastAnnouncementShown', 'true'); }}
        />
      )}

    </main>
  )
}
