// app/page.tsx (VERSIÓN PÚBLICA + LOGIN OPCIONAL)
"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ACHIEVEMENTS, checkAchievement, calculateLevel } from "@/lib/achievements"
import confetti from "canvas-confetti"
import Cookies from 'js-cookie'

// Components
import LaneSelector from "@/components/LaneSelector"
import ChampionCard from "@/components/ChampionCard"
import UserStats from "@/components/UserStats"
import AchievementsList from "@/components/AchievementsList"
import AchievementPopup from "@/components/AchievementPopup"
import VerificationResult from "@/components/VerificationResult"

export default function Home() {
  // User state
  const [user, setUser] = useState<any>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

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
  }

  // SPIN PÚBLICO (sin login)
  const spin = async () => {
    setLoading(true)
    setSpinning(true)
    setVerificationResult(null)
    
    setTimeout(async () => {
      const res = await fetch(`/api/roulette?lane=${selectedLane}`)
      const data = await res.json()
      
      setChamp(data)
      setLoading(false)
      setTimeout(() => setSpinning(false), 500)
    }, 2000)
  }

  // VERIFY (requiere login)
  const handleVerifyClick = () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
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
          championId: champ.key
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
        await handleFailure()
      }

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

    await checkAndUnlockAchievements({
      currentStreak: newStreak,
      totalChallenges: newTotalChallenges,
      level: newLevel
    })
  }

  const handleFailure = async () => {
    if (!user) return
    await supabase.from('users').update({ current_streak: 0 }).eq('id', user.id)
    const updatedUser = { ...user, current_streak: 0 }
    setUser(updatedUser)
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

    Cookies.remove('session_token')
    setUser(null)
    setSessionToken(null)
    setVerificationResult(null)
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

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header con Login/Logout */}
          <div className="flex justify-end mb-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-neutral-400 text-sm">
                  {user.game_name}#{user.tag_line}
                </span>
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

          {/* User Stats (solo si está logueado) */}
          {user && (
            <div className="mb-8">
              <UserStats user={{
                summoner_name: `${user.game_name}#${user.tag_line}`,
                level: user.level,
                xp: user.xp,
                current_streak: user.current_streak,
                longest_streak: user.longest_streak,
                total_challenges_completed: user.total_challenges_completed
              }} />
            </div>
          )}

          {/* Main Grid */}
          <div className={`grid grid-cols-1 ${user ? 'lg:grid-cols-3' : ''} gap-6`}>
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
                disabled={loading}
              />

              {/* Champion Card */}
              <ChampionCard
                champion={champ}
                spinning={spinning}
                onSpin={spin}
                onVerify={handleVerifyClick}
                loading={loading}
                verifying={verifying}
                showVerify={!!champ && !verificationResult}
              />

              {/* CTA para login (solo si no está logueado y ya giró) */}
              {!user && champ && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎯</div>
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

            {/* Right: Achievements (solo si está logueado) */}
            {user && (
              <div className="lg:col-span-1">
                <AchievementsList 
                  unlockedAchievements={userAchievements}
                  newAchievements={newAchievements}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-neutral-600 text-xs">
              League Roulette isn't endorsed by Riot Games
            </p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSuccess={(token, userData) => {
            setSessionToken(token)
            setUser(userData)
            setShowLoginModal(false)
            loadUserData(userData.id)
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
    </main>
  )
}

// Login Modal Component
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
          <div>
            <label className="block text-neutral-400 text-sm mb-2">
              Riot ID
            </label>
            <input
              type="text"
              placeholder="GameName#TAG"
              value={riotId}
              onChange={(e) => {
                setRiotId(e.target.value)
                setError('')
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-white transition"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

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
}