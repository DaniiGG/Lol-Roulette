'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface ChampionMasteryProps {
  puuid: string
  region: string
}

interface MasteryEntry {
  championId: number
  championLevel: number
  championPoints: number
  championPointsUntilNextLevel: number
  championPointsSinceLastLevel: number
  tokensEarned: number
  lastPlayTime: number
}

const DDV = '14.9.1'

let championNameCache: Record<number, string> | null = null

async function getChampionNameMap(): Promise<Record<number, string>> {
  if (championNameCache) return championNameCache
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDV}/data/en_US/champion.json`)
  const data = await res.json()
  const map: Record<number, string> = {}
  for (const key of Object.keys(data.data)) {
    map[Number(data.data[key].key)] = key
  }
  championNameCache = map
  return map
}

export default function ChampionMastery({ puuid, region }: ChampionMasteryProps) {
  const t = useTranslations('championMastery')
  const [masteries, setMasteries] = useState<MasteryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'points' | 'level' | 'name' | 'recent'>('points')
  const [championNames, setChampionNames] = useState<Record<number, string>>({})

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('session_token='))?.split('=')[1]
    if (token) setSessionToken(token)
    getChampionNameMap().then(setChampionNames)
  }, [])

  useEffect(() => {
    if (!puuid || !region || !sessionToken) return

    const fetchMasteries = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/champion-mastery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ puuid, region })
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to fetch mastery')
        }
        const data = await res.json()
        setMasteries(data.masteries || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMasteries()
  }, [puuid, region, sessionToken])

  const getName = (id: number) => championNames[id] || `champion_${id}`

  let sortedMasteries = [...masteries].filter(m => {
    if (selectedLevel !== null && m.championLevel !== selectedLevel) return false
    if (searchQuery && !getName(m.championId).toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (sortBy === 'points') sortedMasteries.sort((a, b) => b.championPoints - a.championPoints)
  else if (sortBy === 'level') sortedMasteries.sort((a, b) => b.championLevel - a.championLevel || b.championPoints - a.championPoints)
  else if (sortBy === 'name') sortedMasteries.sort((a, b) => getName(a.championId).localeCompare(getName(b.championId)))
  else if (sortBy === 'recent') sortedMasteries.sort((a, b) => b.lastPlayTime - a.lastPlayTime)

  const displayMasteries = showAll ? sortedMasteries : sortedMasteries.slice(0, 10)
  const totalPoints = masteries.reduce((sum, m) => sum + m.championPoints, 0)
  const mastery7plus = masteries.filter(m => m.championLevel >= 7).length
  const mastery5plus = masteries.filter(m => m.championLevel >= 5).length

  const formatPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`
    return points.toString()
  }

  const getMasteryEmblem = (level: number) => {
    if (level === 7) return { icon: '🏆', color: 'from-yellow-400 to-amber-600', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' }
    if (level === 6) return { icon: '🌟', color: 'from-purple-400 to-purple-600', text: 'text-purple-300', bg: 'bg-purple-500/10 border-purple-500/30' }
    if (level === 5) return { icon: '💎', color: 'from-blue-400 to-cyan-500', text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
    if (level === 4) return { icon: '🥈', color: 'from-gray-300 to-gray-500', text: 'text-gray-300', bg: 'bg-gray-500/10 border-gray-500/30' }
    return { icon: '⚔️', color: 'from-amber-600 to-amber-800', text: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' }
  }

  const getProgressToNextLevel = (mastery: MasteryEntry) => {
    const total = mastery.championPointsSinceLastLevel + mastery.championPointsUntilNextLevel
    if (total === 0) return 100
    return (mastery.championPointsSinceLastLevel / total) * 100
  }

  if (loading) {
    return (
      <div className="w-full p-12 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-[3px] border-[#C89B3C]/20 border-t-[#C89B3C] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-r-[#00e5ff]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        <p className="text-neutral-500 text-sm animate-pulse">{t('loadingMasteries')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!masteries.length) {
    return (
      <div className="w-full p-12 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md text-center">
        <div className="text-5xl mb-4 opacity-30">🏅</div>
        <p className="text-neutral-400 text-lg">{t('noMasteries')}</p>
      </div>
    )
  }

  const levelCounts = Array.from({ length: 8 }, (_, i) => masteries.filter(m => m.championLevel === i).length)

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#C89B3C]/30 to-[#C89B3C]/5 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">{t('totalPoints')}</p>
            <p className="text-3xl font-black text-[#C89B3C]" style={{ textShadow: '0 0 20px rgba(200,155,60,0.3)' }}>{formatPoints(totalPoints)}</p>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/30 to-cyan-500/5 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">{t('championsPlayed')}</p>
            <p className="text-3xl font-black text-cyan-400" style={{ textShadow: '0 0 20px rgba(0,229,255,0.3)' }}>{masteries.length}</p>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-yellow-500/30 to-yellow-500/5 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">{t('mastery7Plus')}</p>
            <p className="text-3xl font-black text-yellow-400" style={{ textShadow: '0 0 20px rgba(255,200,0,0.3)' }}>{mastery7plus}</p>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 to-blue-500/5 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">{t('mastery5Plus')}</p>
            <p className="text-3xl font-black text-blue-400" style={{ textShadow: '0 0 20px rgba(100,150,255,0.3)' }}>{mastery5plus}</p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
        <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3">{t('levelDistribution')}</p>
        <div className="flex gap-1.5 h-8">
          {levelCounts.slice(1).map((count, i) => {
            const level = i + 1
            const maxCount = Math.max(...levelCounts.slice(1), 1)
            const height = (count / maxCount) * 100
            const colors = ['bg-amber-700', 'bg-amber-600', 'bg-gray-400', 'bg-blue-400', 'bg-purple-400', 'bg-yellow-400', 'bg-yellow-300']
            return (
              <div key={level} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-neutral-500 font-mono">{count}</span>
                <div className="w-full rounded-full overflow-hidden" style={{ height: '100%' }}>
                  <div className={`h-full w-full rounded-full ${colors[level - 1]} transition-all duration-500`} style={{ height: `${height}%`, opacity: count > 0 ? 1 : 0.2 }}></div>
                </div>
                <span className="text-[10px] text-neutral-500">{level}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchChampion')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#C89B3C]/50 focus:ring-1 focus:ring-[#C89B3C]/20 transition"
          />
        </div>
        <div className="flex gap-2">
          {[null, 5, 6, 7].map((level) => (
            <button
              key={level ?? 'all'}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                selectedLevel === level
                  ? 'bg-[#C89B3C]/20 text-[#C89B3C] border border-[#C89B3C]/40'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {level === null ? t('all') : `${level}+`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['points', 'level', 'name', 'recent'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                sortBy === sort
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {t(`sort${sort.charAt(0).toUpperCase() + sort.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {sortedMasteries.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-neutral-400 text-sm hover:text-white hover:border-[#C89B3C]/30 transition flex items-center justify-center gap-2"
        >
          <span>{showAll ? t('showLess') : t('showAll', { count: sortedMasteries.length })}</span>
          <svg className={`w-4 h-4 transition ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      <div className="grid gap-3">
        {displayMasteries.map((mastery, index) => {
          const name = getName(mastery.championId)
          const emblem = getMasteryEmblem(mastery.championLevel)
          return (
            <div
              key={mastery.championId}
              className="group relative p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-[#C89B3C]/30 transition-all duration-300 hover:bg-neutral-900/80"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C89B3C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#C89B3C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${DDV}/img/champion/${name}.png`}
                    alt={name}
                    className="w-14 h-14 rounded-xl border border-neutral-800 group-hover:border-[#C89B3C]/40 transition"
                    loading="lazy"
                  />
                  <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full ${emblem.bg} border flex items-center justify-center text-xs backdrop-blur-sm`}>
                    {emblem.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold truncate">{name}</h4>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${emblem.text} ${emblem.bg}`}>
                      {mastery.championLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[#C89B3C] font-mono font-bold text-sm">{formatPoints(mastery.championPoints)}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-400 text-xs">{mastery.tokensEarned > 0 ? `${mastery.tokensEarned} token${mastery.tokensEarned > 1 ? 's' : ''}` : 'No tokens'}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-500 text-xs">{new Date(mastery.lastPlayTime).toLocaleDateString()}</span>
                  </div>
                  <div className="w-full bg-neutral-950 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${emblem.color}`}
                      style={{ width: `${getProgressToNextLevel(mastery)}%` }}
                    ></div>
                  </div>
                  {mastery.championLevel < 7 && (
                    <p className="text-neutral-600 text-[10px] mt-1">
                      {formatPoints(mastery.championPointsUntilNextLevel)} {t('toNextLevel')}
                    </p>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className="text-neutral-600 text-xs">#{index + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-neutral-950/50 border border-neutral-800 flex items-center justify-center">
                    <svg className={`w-4 h-4 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-neutral-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showAll && (
        <p className="text-center text-neutral-500 text-sm">
          {t('showingAll', { count: displayMasteries.length })}
        </p>
      )}
    </div>
  )
}
