// app/page.tsx (CON AUTO-VERIFICACIÓN)
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ACHIEVEMENTS, checkAchievement, calculateLevel } from "@/lib/achievements"
import confetti from "canvas-confetti"
import Cookies from 'js-cookie'
import { Info } from 'lucide-react'
import AdContainer from "@/components/AdContainer"
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
import { AutoVerifier } from "@/lib/auto-verify"
import RSOLoginModal from "@/components/RSOLoginmodal"

import Script from "next/script"

export default function Home() {
  // User state
  const [user, setUser] = useState<any>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)

  // Roulette state (PÚBLICO - no requiere login)
  const [champ, setChamp] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [selectedLane, setSelectedLane] = useState('all')

  // Premium features (requieren login)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [userAchievements, setUserAchievements] = useState<string[]>([])

  // Active challenge tracking (para evitar spins infinitos)
  const [activeChallenge, setActiveChallenge] = useState<any>(null)
  const [rerollCount, setRerollCount] = useState(0)  // Track rerolls (0-2 allowed)
  const MAX_REROLLS = 2  // 3 total spins = 1 initial + 2 rerolls

  // Info modal
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Auto-verification
  const [autoVerifier, setAutoVerifier] = useState<AutoVerifier | null>(null)
  const [isAutoVerifying, setIsAutoVerifying] = useState(false)

  // Verificar sesión al cargar
  useEffect(() => {
    const token = Cookies.get('session_token')
    if (token) {
      verifyAndLoadSession(token)
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
      loadUserData(userData.id)

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
    // Cargar challenge activo (si existe)
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
      setActiveChallenge(pendingChallenge)
      setChamp({
        id: pendingChallenge.champion_name,
        key: Number(pendingChallenge.champion_id),
        name: pendingChallenge.champion_name,
        lane: pendingChallenge.lane
      })
    }
  }

  // SPIN: llamado por RouletteWheel al terminar la animación
  const handleRouletteResult = async (champData: { id: string; key: string | number; name: string }) => {
    setVerificationResult(null)

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
        if (activeChallenge) {
          const { error } = await supabase
            .from('challenges')
            .update({
              champion_id: String(champData.key),
              champion_name: champData.name,
              lane: selectedLane,
              created_at: new Date().toISOString(),
              reroll_count: newRerollCount  // ✅ NUEVO: Guardar en DB
            })
            .eq('id', activeChallenge.id)
          if (error) {
            console.error('❌ Error updating challenge:', error)
            return
          }

          const updatedChallenge = {
            ...activeChallenge,
            champion_id: String(champData.key),
            champion_name: champData.name,
            lane: selectedLane,
            created_at: new Date().toISOString(),
            reroll_count: newRerollCount  // ✅ NUEVO
          }
          setActiveChallenge(updatedChallenge)

          // Reiniciar auto-verificación
          if (sessionToken) {
            stopAutoVerification()
            startAutoVerification(champData, updatedChallenge.created_at)
          }
        } else {
          // Crear challenge nuevo
          const { data: newChallenge, error } = await supabase
            .from('challenges')
            .insert([{
              user_id: user.id,
              champion_id: String(champData.key),
              champion_name: champData.name,
              lane: selectedLane,
              status: 'pending',
              xp_reward: 100,
              reroll_count: newRerollCount  // ✅ NUEVO: Guardar desde el inicio
            }])
            .select()
            .single()

          if (error) {
            console.error('❌ Error creating challenge:', error)
            return
          }

          setActiveChallenge(newChallenge)

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
          challengeCreatedAt: activeChallenge?.created_at
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

      if (result.success) {
        await handleVictory(result)
      } else {
        await handleFailure(result)
      }

      // Limpiar active challenge
      setActiveChallenge(null)

    } catch (error) {
      console.error('Verification error:', error)
      alert('Error verifying match.')
    } finally {
      setVerifying(false)
    }
  }

  const handleVictory = async (matchData: any) => {
    if (!user) return

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })

    await supabase
      .from('challenges')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        match_id: matchData.matchId,
        match_data: matchData.stats
      })
      .eq('user_id', user.id)
      .eq('champion_name', champ.name)
      .eq('status', 'pending')

    const newXp = user.xp + 100
    const newLevel = calculateLevel(newXp)
    const newStreak = user.current_streak + 1
    const newTotalChallenges = user.total_challenges_completed + 1

    const { data: updatedUser } = await supabase
      .from('users')
      .update({
        xp: newXp,
        level: newLevel,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, user.longest_streak),
        total_challenges_completed: newTotalChallenges
      })
      .eq('id', user.id)
      .select()
      .single()

    setUser(updatedUser)

    // Reset reroll count after successful verification
    setRerollCount(0)
    setActiveChallenge(null)

    await checkAndUnlockAchievements({
      currentStreak: newStreak,
      totalChallenges: newTotalChallenges,
      level: newLevel
    })
  }

  const handleFailure = async (matchData: any) => {
    if (!user) return
    // ✅ NUEVO: Marcar challenge como failed en lugar de solo borrarlo
    if (activeChallenge) {
      await supabase
        .from('challenges')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
           match_id: matchData.matchId,
           match_data: matchData.stats
        })
        .eq('id', activeChallenge.id)
    }
    // Resetear streak
    await supabase.from('users').update({ current_streak: 0 }).eq('id', user.id)
    const updatedUser = { ...user, current_streak: 0 }
    setUser(updatedUser)
    // Reset reroll count and challenge on failure
    setRerollCount(0)
    setActiveChallenge(null)
  }

  const checkAndUnlockAchievements = async (stats: any) => {
    if (!user) return

    const newlyUnlocked: string[] = []

    for (const [type, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (userAchievements.includes(type)) continue

      if (checkAchievement(type as any, stats)) {
        await supabase.from('achievements').insert([{
          user_id: user.id,
          achievement_type: type,
          achievement_name: achievement.name,
          achievement_description: achievement.description
        }])

        await supabase.from('users').update({ xp: user.xp + achievement.xpReward }).eq('id', user.id)

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
    setActiveChallenge(null)
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

          {/* Header con Login/Logout */}
          <div className="flex justify-between items-center mb-4">
            {/* Left side buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInfoModal(true)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition text-sm flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                <span>How it works</span>
              </button>
              <a
                href="/leaderboard"
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>Leaderboard</span>
              </a>
            </div>

            {/* Login/Logout */}
            <div>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-neutral-400 text-sm">
                    {user.game_name}#{user.tag_line}
                  </span>

                  <button
                    onClick={() => setShowAchievementsModal(true)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition text-sm"
                  >
                    🏆Achievements <span className="text-neutral-400 text-sm">
                      {userAchievements.length}/{Object.keys(ACHIEVEMENTS).length}🏆
                    </span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 rounded-xl bg-white text-neutral-950 hover:bg-neutral-100 transition font-semibold text-sm"
                >
                  Login to Track Progress
                </button>
              )}
            </div>
          </div>

          {/* User Stats (solo si está logueado) */}
          {user && (
            <div className="mb-8">
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
          )}

          {/* Main Grid */}
          <div className={`max-w-4xl mx-auto space-y-6`}>
            {/* Left: Roulette (SIEMPRE VISIBLE) */}
            <div className={`${user ? 'lg:col-span-2' : 'max-w-2xl mx-auto w-full'} space-y-6`}>
              {/* Header */}
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-white mb-4 opacity-90">
                  League Roulette
                </h1>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-neutral-500 to-transparent"></div>
                  <p className="text-neutral-400 font-light tracking-widest text-sm uppercase">
                    Discover your champion
                  </p>
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-neutral-500 to-transparent"></div>
                </div>
              </div>

              {/* Lane Selector */}
              <LaneSelector
                selectedLane={selectedLane}
                onLaneChange={setSelectedLane}
                disabled={!!(user && rerollCount > MAX_REROLLS)}
              />

              {/* Reroll limit warning */}
              {user && rerollCount > MAX_REROLLS && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="text-orange-300 text-sm">
                    You've used all 3 spins! Play with <strong>{champ?.name || 'your champion'}</strong> or verify your match to get new spins.
                  </p>
                </div>
              )}

              {/* ★ RULETA VISUAL ★ */}
              <RouletteWheel
                lane={selectedLane}
                onResult={handleRouletteResult}
                disabled={!!(user && rerollCount > MAX_REROLLS)}
                rerollsUsed={user ? rerollCount : 0}
                maxRerolls={MAX_REROLLS}
              />

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
                      Verifying…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verify Match
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

              {/* CTA para login (solo si no está logueado y ya giró) */}
              {!user && champ && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-4">
                    <svg className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2">
                        Want to track your progress?
                      </h3>
                      <p className="text-neutral-300 text-sm mb-4">
                        Login to verify wins, earn XP, unlock achievements, and compete on the leaderboard!
                      </p>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition"
                      >
                        Login with Riot Account
                      </button>
                    </div>
                  </div>
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

          <section className="mx-auto mt-16 max-w-5xl">
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">
                Blog
              </p>
              <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">
                More ways to use League Roulette
              </h2>
              <p className="mx-auto max-w-3xl text-lg leading-8 text-neutral-400">
                Read practical guides about random champion picks, fun League of Legends
                challenges, and fresh ideas for deciding what to play next.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Link
                href="/blog/what-champion-should-i-play"
                className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 transition hover:border-[#C89B3C]/40 hover:bg-neutral-900"
              >
                <h3 className="mb-3 text-2xl font-semibold text-white">
                  What Champion Should I Play?
                </h3>
                <p className="leading-7 text-neutral-400">
                  A guide for players who want fast inspiration before their next queue.
                </p>
              </Link>

              <Link
                href="/blog/lol-random-challenge"
                className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 transition hover:border-[#C89B3C]/40 hover:bg-neutral-900"
              >
                <h3 className="mb-3 text-2xl font-semibold text-white">
                  Fun LoL Random Challenge Ideas
                </h3>
                <p className="leading-7 text-neutral-400">
                  Formats for solo players, duos, and full groups of friends.
                </p>
              </Link>

              <Link
                href="/blog/fun-lol-challenges"
                className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 transition hover:border-[#C89B3C]/40 hover:bg-neutral-900"
              >
                <h3 className="mb-3 text-2xl font-semibold text-white">
                  Fun Ways to Play League of Legends
                </h3>
                <p className="leading-7 text-neutral-400">
                  Challenge ideas that make normal League sessions feel fresh again.
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <RSOLoginModal
          onClose={() => setShowLoginModal(false)}
           onSuccess={(token, user) => {
    console.log('Logged in!', token, user)
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
              <h2 className="text-2xl font-bold text-white">Achievements</h2>
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


    </main>
  )
}

{/*Login Modal Component
function LoginModal({ onClose, onSuccess }: {
  onClose: () => void
  onSuccess: (token: string, user: any) => void
}) {
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('euw1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const REGIONS = [
    { value: 'euw1', label: 'EUW' },
    { value: 'eun1', label: 'EUNE' },
    { value: 'na1', label: 'NA' },
    { value: 'kr', label: 'KR' },
    { value: 'br1', label: 'BR' },
    { value: 'la1', label: 'LAN' },
    { value: 'la2', label: 'LAS' },
    { value: 'oc1', label: 'OCE' },
    { value: 'tr1', label: 'TR' },
    { value: 'ru', label: 'RU' },
    { value: 'jp1', label: 'JP' }
  ]

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      if (!riotId.includes('#')) {
        setError('Invalid format. Use: GameName#TAG')
        setLoading(false)
        return
      }

      const [gameName, tagLine] = riotId.split('#')

      // Verificar Riot ID
      const verifyResponse = await fetch('/api/auth/verify-riot-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName, tagLine, region })
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        setError(error.error || 'Account not found')
        setLoading(false)
        return
      }

      const riotData = await verifyResponse.json()

      // Crear sesión
      const sessionResponse = await fetch('/api/auth/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puuid: riotData.puuid,
          gameName: riotData.gameName,
          tagLine: riotData.tagLine,
          summonerId: riotData.summonerId,
          summonerName: riotData.summonerName,
          summonerLevel: riotData.summonerLevel,
          profileIconId: riotData.profileIconId,
          region: region
        })
      })

      if (!sessionResponse.ok) {
        setError('Error creating session')
        setLoading(false)
        return
      }

      const { token, user } = await sessionResponse.json()

      Cookies.set('session_token', token, { expires: 30, secure: true, sameSite: 'strict' })

      onSuccess(token, user)

    } catch (error) {
      setError('Error verifying account')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Login</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          

          

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-blue-300 text-xs">
            We verify your account using Riot's API. Your password is never stored.
          </p>
        </div>
      </div>
    </div>
  )
*/}
