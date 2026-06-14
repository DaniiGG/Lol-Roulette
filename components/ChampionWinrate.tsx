'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { getChampionsByLane } from '@/lib/champion-lanes'

interface ChampionWinrateProps {
  puuid: string
  region: string
}

interface ChampionWinrateEntry {
  championName: string
  wins: number
  losses: number
  total: number
  winrate: number
}

const LANES = ['all', 'top', 'jungle', 'mid', 'adc', 'support'] as const
const DDV = '14.9.1'

export default function ChampionWinrate({ puuid, region }: ChampionWinrateProps) {
  const t = useTranslations('championWinrate')
  const [champions, setChampions] = useState<ChampionWinrateEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLane, setSelectedLane] = useState<typeof LANES[number]>('all')
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('session_token='))?.split('=')[1]
    if (token) setSessionToken(token)
  }, [])

  useEffect(() => {
    if (!puuid || !region || !sessionToken) return

    const fetchWinrate = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/champion-winrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ puuid, region })
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to fetch winrate')
        }
        const data = await res.json()
        setChampions(data.champions || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWinrate()
  }, [puuid, region, sessionToken])

  const laneChampions = useMemo(() => {
    if (selectedLane === 'all') return champions
    const laneChampNames = getChampionsByLane(selectedLane)
    return champions.filter(c => laneChampNames.includes(c.championName))
  }, [champions, selectedLane])

  const getWinrateColor = (wr: number) => {
    if (wr >= 60) return 'text-green-400'
    if (wr >= 50) return 'text-yellow-400'
    if (wr >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getWinrateBarColor = (wr: number) => {
    if (wr >= 60) return 'bg-green-500'
    if (wr >= 50) return 'bg-yellow-500'
    if (wr >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="w-full p-12 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-[3px] border-[#C89B3C]/20 border-t-[#C89B3C] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-r-[#00e5ff]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        <p className="text-neutral-500 text-sm animate-pulse">{t('loading')}</p>
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

  if (!champions.length) {
    return (
      <div className="w-full p-12 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md text-center">
        <div className="text-5xl mb-4 opacity-30">📊</div>
        <p className="text-neutral-400 text-lg">{t('noData')}</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap gap-2">
        {LANES.map((lane) => (
          <button
            key={lane}
            onClick={() => setSelectedLane(lane)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedLane === lane
                ? 'bg-[#C89B3C]/20 text-[#C89B3C] border border-[#C89B3C]/40'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {t(`lane.${lane}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {laneChampions.map((champ) => (
          <div
            key={champ.championName}
            className="group relative p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-[#C89B3C]/30 transition-all duration-300 hover:bg-neutral-900/80"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C89B3C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDV}/img/champion/${champ.championName}.png`}
                  alt={champ.championName}
                  className="w-14 h-14 rounded-xl border border-neutral-800 group-hover:border-[#C89B3C]/40 transition"
                  loading="lazy"
                  onError={(e) => {
                    const names: Record<string, string> = {
                      "Bel'Veth": "Belveth",
                      "Cho'Gath": "Chogath",
                      "Dr. Mundo": "DrMundo",
                      "Jarvan IV": "JarvanIV",
                      "K'Sante": "KSante",
                      "Kha'Zix": "Khazix",
                      "Kog'Maw": "KogMaw",
                      "LeBlanc": "Leblanc",
                      "Lee Sin": "LeeSin",
                      "Master Yi": "MasterYi",
                      "Miss Fortune": "MissFortune",
                      "Nunu & Willump": "Nunu",
                      "Rek'Sai": "RekSai",
                      "Renata Glasc": "Renata",
                      "Tahm Kench": "TahmKench",
                      "Twisted Fate": "TwistedFate",
                      "Vel'Koz": "Velkoz",
                      "Wukong": "MonkeyKing",
                      "Xin Zhao": "XinZhao",
                      "Aurelion Sol": "AurelionSol",
                    }
                    const target = (e.target as HTMLImageElement)
                    if (names[champ.championName]) {
                      target.src = `https://ddragon.leagueoflegends.com/cdn/${DDV}/img/champion/${names[champ.championName]}.png`
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-semibold truncate">{champ.championName}</h4>
                  <span className={`text-lg font-black ${getWinrateColor(champ.winrate)}`}>
                    {champ.winrate}%
                  </span>
                  <span className="text-neutral-500 text-xs">
                    {champ.wins}{t('wins')} / {champ.losses}{t('losses')}
                  </span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getWinrateBarColor(champ.winrate)}`}
                    style={{ width: `${champ.winrate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-neutral-600 text-xs">{champ.total} {t('games')}</span>
                  <span className="text-neutral-600 text-xs">{champ.wins}/{champ.losses}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!laneChampions.length && selectedLane !== 'all' && (
        <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-center">
          <p className="text-neutral-500">{t('noLaneData', { lane: t(`lane.${selectedLane}`) })}</p>
        </div>
      )}
    </div>
  )
}
