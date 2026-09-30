"use client"

import { useState, useCallback } from "react"
import { useTranslations } from 'next-intl'
import { RefreshCw, Clock, Loader2 } from 'lucide-react'

interface MatchResult {
  success: boolean
  playedCorrectChampion: boolean
  won: boolean
  championPlayed: string
  championIdExpected: number
  championIdPlayed: number
  matchId: string
  gameMode: string
  gameDuration: number
  stats: {
    kills: number
    deaths: number
    assists: number
    cs: number
    gold: number
  }
}

interface SimulatedMatch {
  championId: number
  championName: string
  won: boolean
  timestamp: string
}

export default function MatchSimulator() {
  const t = useTranslations('verificationResult')
  const [puuid, setPuuid] = useState('')
  const [region, setRegion] = useState('euw1')
  const [championId, setChampionId] = useState<number>(103)
  const [challengeCreatedAt, setChallengeCreatedAt] = useState('')
  const [expectedChampionId, setExpectedChampionId] = useState<number>(103)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [history, setHistory] = useState<MatchResult[]>([])
  const [simulatedMatches, setSimulatedMatches] = useState<SimulatedMatch[]>([])
  const [activeTab, setActiveTab] = useState<'verify' | 'simulate'>('verify')

  const regions = [
    { value: 'br1', label: 'BR' },
    { value: 'eun1', label: 'EUNE' },
    { value: 'euw1', label: 'EUW' },
    { value: 'jp1', label: 'JP' },
    { value: 'kr', label: 'KR' },
    { value: 'la1', label: 'LAS' },
    { value: 'la2', label: 'LAN' },
    { value: 'na1', label: 'NA' },
    { value: 'oc1', label: 'OCE' },
  ]

  const popularChampions = [
    { id: 266, name: 'Aatrox' }, { id: 103, name: 'Ahri' }, { id: 875, name: 'Sett' },
    { id: 157, name: 'Yasuo' }, { id: 238, name: 'Zed' }, { id: 64, name: 'Lee Sin' },
    { id: 234, name: 'Viego' }, { id: 81, name: 'Ezreal' }, { id: 15, name: 'Sivir' },
    { id: 517, name: 'Sylas' }, { id: 92, name: 'Riven' }, { id: 11, name: 'Master Yi' },
    { id: 711, name: 'Vex' }, { id: 131, name: 'Diana' }, { id: 5, name: 'Xin Zhao' },
  ]

  const fetchMatches = async () => {
    if (!puuid || !region || !championId) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puuid,
          region,
          championId,
          challengeCreatedAt: challengeCreatedAt || undefined
        })
      })

      if (res.status === 204) {
        setResult({
          success: false,
          playedCorrectChampion: false,
          won: false,
          championPlayed: 'No new matches found yet',
          championIdExpected: championId,
          championIdPlayed: 0,
          matchId: '',
          gameMode: '',
          gameDuration: 0,
          stats: { kills: 0, deaths: 0, assists: 0, cs: 0, gold: 0 }
        })
        setLoading(false)
        return
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        setResult({
          success: false,
          playedCorrectChampion: false,
          won: false,
          championPlayed: err.error || 'Verification failed',
          championIdExpected: championId,
          championIdPlayed: 0,
          matchId: '',
          gameMode: '',
          gameDuration: 0,
          stats: { kills: 0, deaths: 0, assists: 0, cs: 0, gold: 0 }
        })
        setLoading(false)
        return
      }

      const data: MatchResult = await res.json()
      setResult(data)
      setHistory(prev => [data, ...prev])
    } catch (error) {
      console.error('Verification error:', error)
      setResult({
        success: false,
        playedCorrectChampion: false,
        won: false,
        championPlayed: 'Error connecting to server',
        championIdExpected: championId,
        championIdPlayed: 0,
        matchId: '',
        gameMode: '',
        gameDuration: 0,
        stats: { kills: 0, deaths: 0, assists: 0, cs: 0, gold: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  const simulateMatch = useCallback((champId: number, won: boolean) => {
    const match: SimulatedMatch = {
      championId: champId,
      championName: popularChampions.find(c => c.id === champId)?.name || `Champion_${champId}`,
      won,
      timestamp: new Date().toISOString()
    }
    setSimulatedMatches(prev => [...prev, match])
  }, [])

  const simulateVerification = () => {
    if (!simulatedMatches.length || !expectedChampionId) return

    const latestMatch = simulatedMatches[simulatedMatches.length - 1]
    const playedChampId = latestMatch.championId
    const playedCorrectChampion = playedChampId === expectedChampionId
    const won = latestMatch.won

    const matchResult: MatchResult = {
      success: playedCorrectChampion && won,
      playedCorrectChampion,
      won,
      championPlayed: latestMatch.championName,
      championIdExpected: expectedChampionId,
      championIdPlayed: playedChampId,
      matchId: `sim-${Date.now()}`,
      gameMode: 'RANKED',
      gameDuration: Math.floor(Math.random() * 1800) + 1200,
      stats: {
        kills: Math.floor(Math.random() * 15),
        deaths: Math.floor(Math.random() * 10) + 1,
        assists: Math.floor(Math.random() * 20),
        cs: Math.floor(Math.random() * 200) + 100,
        gold: Math.floor(Math.random() * 20000) + 10000
      }
    }

    setResult(matchResult)
    setHistory(prev => [matchResult, ...prev])
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isWin = result?.success && result?.won
  const isCorrect = result?.playedCorrectChampion

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4">
      <div className="rounded-2xl border border-[#C89B3C]/40 bg-gradient-to-br from-[#1a1600] to-[#0f0f11] p-6">
        <h2 className="text-2xl font-bold text-white mb-2">🧪 Match Verification Simulator</h2>
        <p className="text-neutral-400 text-sm">
          Test the match verification system with real Riot API data or simulated matches
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('verify')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition ${
            activeTab === 'verify'
              ? 'bg-[#C89B3C] text-neutral-950'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          🔍 Real Verification
        </button>
        <button
          onClick={() => setActiveTab('simulate')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition ${
            activeTab === 'simulate'
              ? 'bg-[#C89B3C] text-neutral-950'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          🎲 Simulate Match
        </button>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">PUUID</label>
          <input
            type="text"
            value={puuid}
            onChange={(e) => setPuuid(e.target.value)}
            placeholder="Your puuid..."
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#C89B3C] font-mono"
          />
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#C89B3C]"
          >
            {regions.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Challenge Champion ID</label>
          <input
            type="number"
            value={championId}
            onChange={(e) => setChampionId(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#C89B3C] font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Challenge Created At (optional)</label>
          <input
            type="datetime-local"
            value={challengeCreatedAt}
            onChange={(e) => setChallengeCreatedAt(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#C89B3C]"
          />
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Expected Champion ID (for simulation)</label>
          <select
            value={expectedChampionId}
            onChange={(e) => setExpectedChampionId(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#C89B3C]"
          >
            {popularChampions.map(c => (
              <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active tab content */}
      {activeTab === 'verify' && (
        <button
          onClick={fetchMatches}
          disabled={loading || !puuid || !region || !championId}
          className="w-full py-4 rounded-xl bg-[#C89B3C] hover:bg-[#d9aa44] text-neutral-950 font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          {loading ? 'Verifying...' : 'Verify Match'}
        </button>
      )}

      {activeTab === 'simulate' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {popularChampions.slice(0, 8).map(champ => (
              <button
                key={champ.id}
                onClick={() => simulateMatch(champ.id, Math.random() > 0.3)}
                className="px-2 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:border-[#C89B3C] hover:text-white transition"
              >
                {champ.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (simulatedMatches.length > 0) simulateVerification()
              }}
              disabled={simulatedMatches.length === 0}
              className="flex-1 py-3 rounded-xl bg-[#C89B3C] hover:bg-[#d9aa44] text-neutral-950 font-bold transition disabled:opacity-50"
            >
              🎯 Verify Last Simulated Match
            </button>
            <button
              onClick={() => {
                if (simulatedMatches.length > 0) {
                  const last = simulatedMatches[simulatedMatches.length - 1]
                  simulateMatch(last.championId, !last.won)
                }
              }}
              disabled={simulatedMatches.length === 0}
              className="px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition disabled:opacity-50"
            >
              ❌ Lose Last
            </button>
            <button
              onClick={() => { setSimulatedMatches([]); setResult(null) }}
              className="px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition"
            >
              🗑️ Clear
            </button>
          </div>
          {simulatedMatches.length > 0 && (
            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <p className="text-xs text-neutral-500 uppercase mb-2">Simulated Match History:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {simulatedMatches.slice(-5).reverse().map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${m.won ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-neutral-300">{m.championName}</span>
                    <span className={m.won ? 'text-green-400' : 'text-red-400'}>{m.won ? 'W' : 'L'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className={`rounded-2xl border-2 p-6 relative overflow-hidden ${
          isWin
            ? 'border-emerald-500/50 bg-emerald-500/10'
            : isCorrect
            ? 'border-amber-500/40 bg-amber-500/10'
            : 'border-red-500/40 bg-red-500/10'
        }`}>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{isWin ? '🏆' : isCorrect ? '😔' : '💀'}</span>
              <div>
                <h3 className={`text-2xl font-bold tracking-tight ${
                  isWin ? 'text-emerald-400' : isCorrect ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {isWin ? 'Victory' : isCorrect ? 'Defeat' : 'Challenge Failed'}
                </h3>
                <p className="text-zinc-400 text-sm mt-0.5">
                  {isCorrect
                    ? `Played ${result.championPlayed}`
                    : `Wrong champion! Played ${result.championPlayed ?? ''} vs expected ${result.championIdExpected}`
                  }
                  {isCorrect && !result.won && ' - Bad luck!'}
                </p>
              </div>
            </div>

            {result.stats && (
              <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/5">
                <div className="text-center bg-zinc-900/60 rounded-lg p-3">
                  <p className="text-zinc-500 text-[10px] uppercase">KDA</p>
                  <p className="text-white font-bold">{result.stats.kills}/{result.stats.deaths}/{result.stats.assists}</p>
                </div>
                <div className="text-center bg-zinc-900/60 rounded-lg p-3">
                  <p className="text-zinc-500 text-[10px] uppercase">CS</p>
                  <p className="text-white font-bold">{result.stats.cs}</p>
                </div>
                <div className="text-center bg-zinc-900/60 rounded-lg p-3">
                  <p className="text-zinc-500 text-[10px] uppercase">Gold</p>
                  <p className="text-white font-bold">{Math.round(result.stats.gold / 1000)}k</p>
                </div>
                <div className="text-center bg-zinc-900/60 rounded-lg p-3">
                  <p className="text-zinc-500 text-[10px] uppercase">Duration</p>
                  <p className="text-white font-bold">{formatDuration(result.gameDuration)}</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
              <span>Match: {result.matchId ? result.matchId.slice(0, 12) + '...' : 'N/A'}</span>
              <span>Expected: {result.championIdExpected} → Played: {result.championIdPlayed}</span>
              <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                {result.success ? '✅ VERIFIED' : '❌ NOT VERIFIED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Verification History
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-neutral-800/50 rounded-lg p-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={h.success ? 'text-green-400' : 'text-red-400'}>
                    {h.success ? '✅' : '❌'}
                  </span>
                  <span className="text-neutral-300">
                    Expected: {h.championIdExpected} → Played: {h.championIdPlayed} ({h.championPlayed})
                  </span>
                </div>
                <span className={h.won ? 'text-green-400' : 'text-red-400'}>
                  {h.won ? 'W' : 'L'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick test champions */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
        <h3 className="text-sm font-bold text-white mb-3">Quick Test Champions</h3>
        <div className="flex flex-wrap gap-2">
          {popularChampions.slice(0, 12).map(champ => (
            <button
              key={champ.id}
              onClick={() => { setChampionId(champ.id); setExpectedChampionId(champ.id) }}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:border-[#C89B3C] transition"
            >
              {champ.name} ({champ.id})
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
