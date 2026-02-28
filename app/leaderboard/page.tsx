// app/leaderboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'
import Link from 'next/link'

interface LeaderboardEntry {
  rank: number
  id: string
  gameName: string
  tagLine: string
  level: number
  xp: number
  currentStreak: number
  longestStreak: number
  totalChallenges: number
  profileIconId: number
}

type Category = 'xp' | 'streak' | 'longest_streak' | 'challenges' | 'level'

const CATEGORIES = [
  { value: 'xp' as Category, label: 'Total XP', icon: '⭐', description: 'Most experience points earned' },
  { value: 'level' as Category, label: 'Highest Level', icon: '🎖️', description: 'Highest player level' },
  { value: 'challenges' as Category, label: 'Most Challenges', icon: '🏆', description: 'Most challenges completed' },
  { value: 'streak' as Category, label: 'Current Streak', icon: '🔥', description: 'Longest active win streak' },
  { value: 'longest_streak' as Category, label: 'Best Streak', icon: '💪', description: 'Best win streak of all time' },
]

export default function LeaderboardPage() {
  const [category, setCategory] = useState<Category>('xp')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)

  // Verificar sesión
  useEffect(() => {
    const token = Cookies.get('session_token')
    if (token) {
      verifySession(token)
    }
  }, [])

  const verifySession = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const { user } = await response.json()
        setCurrentUserId(user.id)
      }
    } catch (error) {
      console.error('Session verification error:', error)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [category, currentUserId])

  const loadLeaderboard = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/leaderboard?category=${category}&limit=100`)
      
      if (!response.ok) {
        throw new Error('Failed to load leaderboard')
      }

      const data = await response.json()
      setLeaderboard(data.leaderboard)

      // Buscar posición del usuario actual
      if (currentUserId) {
        const userEntry = data.leaderboard.find((entry: LeaderboardEntry) => entry.id === currentUserId)
        setUserRank(userEntry || null)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const currentCategory = CATEGORIES.find(c => c.value === category)!

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-300'
    if (rank === 3) return 'text-orange-400'
    return 'text-neutral-400'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getStatValue = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'xp': return entry.xp
      case 'level': return entry.level
      case 'challenges': return entry.totalChallenges
      case 'streak': return entry.currentStreak
      case 'longest_streak': return entry.longestStreak
      default: return 0
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Game
          </Link>

          <h1 className="text-5xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-neutral-400">Compete with the best League Roulette players</p>
        </div>

        {/* User's Rank Card (if logged in and not in top 100) */}
        {currentUserId && userRank && userRank.rank > 10 && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border-2 border-[#C89B3C]">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C89B3C]">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${userRank.profileIconId || 0}.png`}
                    alt="Your profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-400 mb-1">Your Rank</p>
                <p className="text-white font-semibold">
                  {userRank.gameName}<span className="text-neutral-500">#{userRank.tagLine}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#C89B3C]">#{userRank.rank}</p>
                <p className="text-sm text-neutral-400">{getStatValue(userRank).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`
                  p-4 rounded-xl font-semibold text-sm
                  transition-all duration-200
                  ${category === cat.value
                    ? 'bg-[#C89B3C] text-neutral-950 shadow-lg shadow-[#C89B3C]/30'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }
                `}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-xs">{cat.label}</div>
              </button>
            ))}
          </div>
          <p className="text-neutral-500 text-sm mt-3 text-center">
            {currentCategory.description}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin w-12 h-12 text-[#C89B3C] mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-neutral-400">Loading leaderboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="px-6 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && !error && (
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.id === currentUserId
              const isTopThree = entry.rank <= 3

              return (
                <div
                  key={entry.id}
                  className={`
                    relative overflow-hidden rounded-xl p-4
                    transition-all duration-200
                    ${isCurrentUser
                      ? 'bg-gradient-to-r from-[#C89B3C]/20 to-transparent border-2 border-[#C89B3C] shadow-lg scale-[1.02]'
                      : isTopThree
                        ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 border-2 border-neutral-700'
                        : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`
                      flex-shrink-0 w-14 h-14 flex items-center justify-center
                      rounded-xl font-bold text-xl
                      ${isTopThree ? 'bg-neutral-800' : 'bg-neutral-800/50'}
                    `}>
                      <span className={getRankColor(entry.rank)}>
                        {getRankIcon(entry.rank)}
                      </span>
                    </div>

                    {/* Profile Icon */}
                    <div className="flex-shrink-0">
                      <div className={`
                        w-14 h-14 rounded-full overflow-hidden border-2
                        ${isCurrentUser ? 'border-[#C89B3C]' : 'border-neutral-700'}
                      `}>
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${entry.profileIconId || 0}.png`}
                          alt={entry.gameName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/profileicon/0.png'
                          }}
                        />
                      </div>
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold text-lg truncate">
                          {entry.gameName}
                          <span className="text-neutral-500">#{entry.tagLine}</span>
                        </p>
                        {isCurrentUser && (
                          <span className="px-2 py-1 rounded-lg bg-[#C89B3C] text-neutral-950 text-xs font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span>Level {entry.level}</span>
                        <span>•</span>
                        <span>{entry.totalChallenges} challenges</span>
                      </div>
                    </div>

                    {/* Stat Value */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-3xl font-bold text-[#C89B3C]">
                        {getStatValue(entry).toLocaleString()}
                      </p>
                      <p className="text-neutral-500 text-xs mt-1">
                        {currentCategory.label}
                      </p>
                    </div>
                  </div>

                  {/* Top 3 Glow Effect */}
                  {isTopThree && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className={`absolute inset-0 opacity-5 ${
                        entry.rank === 1 ? 'bg-yellow-400' :
                        entry.rank === 2 ? 'bg-gray-300' :
                        'bg-orange-400'
                      }`} />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Empty State */}
            {leaderboard.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-neutral-400 text-xl mb-2">No rankings yet</p>
                <p className="text-neutral-600 text-sm mb-6">Be the first to complete challenges and claim the top spot!</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition"
                >
                  Start Playing
                </Link>
              </div>
            )}
          </div>
        )}

        {/* CTA for non-logged users */}
        {!currentUserId && leaderboard.length > 0 && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 text-center">
            <p className="text-white text-lg font-semibold mb-2">Want to compete?</p>
            <p className="text-neutral-400 text-sm mb-4">Login to track your progress and climb the leaderboard!</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition"
            >
              Login & Start Playing
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}