'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

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

const DDV = '16.12.1'

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

function RadialGauge({ value, max, label, color, glowColor }: {
  value: number
  max: number
  label: string
  color: string
  glowColor: string
}) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const radius = 56
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 200)
    return () => clearTimeout(timer)
  }, [value])

  const displayOffset = circumference * (1 - Math.min(animatedValue / max, 1))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700"
        style={{ background: `linear-gradient(135deg, ${glowColor}, transparent)` }}
      />
      <div className="relative p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/60 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <svg width="130" height="130" viewBox="0 0 130 130" className="mx-auto">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={displayOffset}
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <text x="65" y="52" textAnchor="middle" className="fill-white font-black" fontSize="22" fontFamily="Outfit, sans-serif">
            {value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
          </text>
          <text x="65" y="72" textAnchor="middle" className="fill-neutral-500" fontSize="10" fontFamily="Outfit, sans-serif">
            {label}
          </text>
        </svg>
      </div>
    </motion.div>
  )
}

function LevelPyramid({ levelCounts, championNames, masteries, getName }: {
  levelCounts: number[]
  championNames: Record<number, string>
  masteries: MasteryEntry[]
  getName: (id: number) => string
}) {
  const maxCount = Math.max(...levelCounts.slice(1), 1)

  const levelConfig = [
    { level: 1, color: 'from-amber-800 to-amber-700', text: 'text-amber-400', bg: 'bg-amber-900/40' },
    { level: 2, color: 'from-amber-700 to-amber-600', text: 'text-amber-400', bg: 'bg-amber-800/40' },
    { level: 3, color: 'from-amber-600 to-amber-500', text: 'text-amber-300', bg: 'bg-amber-700/40' },
    { level: 4, color: 'from-gray-400 to-gray-300', text: 'text-gray-200', bg: 'bg-gray-600/40' },
    { level: 5, color: 'from-blue-500 to-cyan-400', text: 'text-blue-300', bg: 'bg-blue-700/40' },
    { level: 6, color: 'from-purple-500 to-purple-400', text: 'text-purple-300', bg: 'bg-purple-700/40' },
    { level: 7, color: 'from-yellow-400 to-amber-500', text: 'text-yellow-300', bg: 'bg-yellow-700/40' },
  ]

  const getChampionsAtLevel = (level: number) =>
    masteries.filter(m => m.championLevel === level).slice(0, 12)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/60 backdrop-blur-sm"
    >
      <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5 font-semibold">Level Pyramid</h3>
      <div className="flex items-end gap-1.5 h-52">
        {levelCounts.slice(1).map((count, i) => {
          const level = i + 1
          const cfg = levelConfig[i] || levelConfig[0]
          const height = (count / maxCount) * 100
          const champs = getChampionsAtLevel(level)
          return (
            <div key={level} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[11px] font-mono font-bold text-neutral-400">{count}</span>
              <div className="w-full rounded-lg overflow-hidden relative flex flex-col justify-end transition-all duration-700"
                style={{ height: `${Math.max(height, count > 0 ? 8 : 3)}%` }}
              >
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full rounded-lg bg-gradient-to-t ${cfg.color}`}
                  style={{ opacity: count > 0 ? 1 : 0.15 }}
                />
                {champs.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5 flex-wrap px-0.5 py-1">
                    {champs.map(c => (
                      <img
                        key={c.championId}
                        src={`https://ddragon.leagueoflegends.com/cdn/${DDV}/img/champion/${getName(c.championId)}.png`}
                        alt=""
                        className="w-4 h-4 rounded-full border border-white/10 opacity-80"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`text-[11px] font-bold ${cfg.text}`}
              >
                {level}
              </motion.span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function ChampionCard({ mastery, getName, index, DDV: ddv, pointsLabel, toNextLevelLabel }: {
  mastery: MasteryEntry
  getName: (id: number) => string
  index: number
  DDV: string
  pointsLabel: string
  toNextLevelLabel: string
}) {
  const [imgError, setImgError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const name = getName(mastery.championId)
  const points = mastery.championPoints
  const level = mastery.championLevel

  const levelEmblems = [
    {},
    { glow: '#C89B3C', border: 'border-amber-700/80', gem: 'from-amber-800 to-amber-700', text: 'text-amber-400', label: 'I' },
    { glow: '#C89B3C', border: 'border-amber-600/80', gem: 'from-amber-700 to-amber-600', text: 'text-amber-400', label: 'II' },
    { glow: '#C89B3C', border: 'border-amber-500/80', gem: 'from-amber-600 to-amber-500', text: 'text-amber-300', label: 'III' },
    { glow: '#a0a0a0', border: 'border-gray-400/80', gem: 'from-gray-400 to-gray-300', text: 'text-gray-200', label: 'IV' },
    { glow: '#3b82f6', border: 'border-blue-500/80', gem: 'from-blue-500 to-cyan-400', text: 'text-blue-300', label: 'V' },
    { glow: '#a855f7', border: 'border-purple-500/80', gem: 'from-purple-500 to-purple-400', text: 'text-purple-300', label: 'VI' },
    { glow: '#eab308', border: 'border-yellow-500/80', gem: 'from-yellow-400 to-amber-500', text: 'text-yellow-300', label: 'VII' },
  ]
  const em = levelEmblems[level] || levelEmblems[0]

  const progress = mastery.championLevel >= 7 ? 100 : (
    mastery.championPointsSinceLastLevel /
    (mastery.championPointsSinceLastLevel + mastery.championPointsUntilNextLevel || 1)
  ) * 100
  const progressCircumference = 2 * Math.PI * 18

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${em.glow}15, transparent 40%)`,
        }}
      />
      <div
        className={`relative rounded-2xl border ${em.border} overflow-hidden transition-all duration-500
          ${isHovered ? 'scale-[1.02] shadow-2xl' : 'shadow-none'}
          bg-neutral-900/80 backdrop-blur-sm`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/20 to-neutral-950/90 pointer-events-none" />
        <div className="relative p-3.5">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl blur-md transition-opacity duration-500"
                style={{ background: em.glow, opacity: isHovered ? 0.4 : 0.15 }}
              />
              <div className="relative w-14 h-14">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10">
                  {!imgError ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/${ddv}/img/champion/${name}.png`}
                      alt={name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs font-bold">
                      ?
                    </div>
                  )}
                </div>
                <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br ${em.gem} border border-white/20
                  flex items-center justify-center text-[8px] font-black ${em.text} shadow-lg`}
                >
                  {level}
                </div>
              </div>
              <svg width="72" height="72" viewBox="0 0 72 72" className="absolute -top-1 -left-1 pointer-events-none">
                <circle cx="36" cy="36" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                <motion.circle
                  cx="36" cy="36" r="18"
                  fill="none"
                  stroke={em.glow}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={progressCircumference}
                  initial={{ strokeDashoffset: progressCircumference }}
                  animate={{ strokeDashoffset: progressCircumference * (1 - progress / 100) }}
                  transition={{ duration: 1.5, delay: 0.3 + index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  transform="rotate(-90 36 36)"
                  style={{ opacity: mastery.championLevel < 7 ? 1 : 0.3 }}
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-bold truncate text-sm">{name}</h4>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[#C89B3C] font-black text-base" style={{ textShadow: '0 0 12px rgba(200,155,60,0.3)' }}>
                  {points >= 1000000 ? `${(points / 1000000).toFixed(1)}M` : points >= 1000 ? `${(points / 1000).toFixed(1)}K` : points}
                </span>
                <span className="text-neutral-600 text-[10px]">{pointsLabel}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px]">
                <span className="text-neutral-500">{mastery.tokensEarned > 0 ? `${mastery.tokensEarned} token${mastery.tokensEarned > 1 ? 's' : ''}` : ''}</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-500">{new Date(mastery.lastPlayTime).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {isHovered && mastery.championLevel < 7 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2.5 pt-2.5 border-t border-white/5"
              >
                <p className="text-neutral-600 text-[10px]">
                  <span className="font-mono text-neutral-400">
                    {(mastery.championPointsUntilNextLevel >= 1000
                      ? `${(mastery.championPointsUntilNextLevel / 1000).toFixed(1)}K`
                      : mastery.championPointsUntilNextLevel)}
                  </span>
                  {' '}{toNextLevelLabel}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  const getName = useCallback((id: number) => championNames[id] || `champion_${id}`, [championNames])

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

  const levelCounts = Array.from({ length: 8 }, (_, i) => masteries.filter(m => m.championLevel === i).length)

  useEffect(() => {
    if (!canvasRef.current || !masteries.length || !Object.keys(championNames).length) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let stars: { x: number; y: number; size: number; alpha: number; speed: number; phase: number; name: string; level: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx!.scale(1, 1)
    }
    resize()
    window.addEventListener('resize', resize)

    const numStars = Math.min(masteries.length, 40)
    const shuffled = [...masteries].sort(() => Math.random() - 0.5).slice(0, numStars)

    stars = shuffled.map((m, i) => ({
      x: (Math.cos((i / numStars) * Math.PI * 2 + 1) * 0.3 + 0.5) * canvas.width,
      y: (Math.sin((i / numStars) * Math.PI * 2 + 1) * 0.15 + 0.45) * canvas.height,
      size: Math.min(8, Math.max(2, Math.log(m.championPoints) / 2)),
      alpha: 0.4 + Math.random() * 0.4,
      speed: 0.002 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
      name: getName(m.championId),
      level: m.championLevel
    }))

    const levelColors: Record<number, string> = {
      7: '#eab308', 6: '#a855f7', 5: '#3b82f6',
      4: '#a0a0a0', 3: '#d97706', 2: '#b45309', 1: '#92400e'
    }

    const draw = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height)
      const time = Date.now() * 0.001

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const pulse = 0.7 + 0.3 * Math.sin(time * s.speed + s.phase)
        const alpha = s.alpha * pulse

        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.size * pulse, 0, Math.PI * 2)

        const color = levelColors[s.level] || '#C89B3C'
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx!.fill()

        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.size * pulse * 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`
        ctx!.fill()

        for (let j = i + 1; j < stars.length; j++) {
          const t = stars[j]
          const dx = s.x - t.x
          const dy = s.y - t.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            ctx!.beginPath()
            ctx!.moveTo(s.x, s.y)
            ctx!.lineTo(t.x, t.y)
            ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.06 * (1 - dist / 180)})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }

        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`
        ctx!.font = '9px Outfit, sans-serif'
        ctx!.textAlign = 'center'
        ctx!.fillText(s.name, s.x, s.y + s.size * pulse + 10)
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [masteries, championNames, getName])

  const sortOptions = [
    { key: 'points', label: t('sortPoints') },
    { key: 'level', label: t('sortLevel') },
    { key: 'name', label: t('sortName') },
    { key: 'recent', label: t('sortRecent') },
  ] as const

  if (loading) {
    return (
      <div className="w-full p-12 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-[3px] border-[#C89B3C]/20 border-t-[#C89B3C] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-[3px] border-transparent border-r-[#00e5ff]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        <p className="text-neutral-500 text-sm animate-pulse tracking-wide">{t('loadingMasteries')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-12 rounded-3xl bg-neutral-900/60 border border-red-500/20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    )
  }

  if (!masteries.length) {
    return (
      <div className="w-full p-16 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md text-center">
        <div className="text-6xl mb-5 opacity-30">🏅</div>
        <p className="text-neutral-400 text-xl font-light">{t('noMasteries')}</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        style={{ height: '300px' }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <RadialGauge
          value={totalPoints}
          max={Math.max(totalPoints, 1000000)}
          label={t('totalPoints')}
          color="#C89B3C"
          glowColor="#C89B3C"
        />
        <RadialGauge
          value={masteries.length}
          max={170}
          label={t('championsPlayed')}
          color="#00e5ff"
          glowColor="#00e5ff"
        />
        <RadialGauge
          value={mastery7plus}
          max={Math.max(mastery7plus, masteries.length)}
          label={t('mastery7Plus')}
          color="#eab308"
          glowColor="#eab308"
        />
        <RadialGauge
          value={mastery5plus}
          max={Math.max(mastery5plus, masteries.length)}
          label={t('mastery5Plus')}
          color="#3b82f6"
          glowColor="#3b82f6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2">
          <LevelPyramid
            levelCounts={levelCounts}
            championNames={championNames}
            masteries={masteries}
            getName={getName}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
        >
          <div className="text-5xl">🎯</div>
          <div className="text-center">
            <p className="text-3xl font-black text-white">{masteries.length}</p>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">{t('championsPlayed')}</p>
          </div>
          <div className="w-full flex justify-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-yellow-400 font-bold">{mastery7plus}</p>
              <p className="text-neutral-600 text-[10px]">M7</p>
            </div>
            <div className="text-center">
              <p className="text-purple-400 font-bold">{masteries.filter(m => m.championLevel === 6).length}</p>
              <p className="text-neutral-600 text-[10px]">M6</p>
            </div>
            <div className="text-center">
              <p className="text-blue-400 font-bold">{masteries.filter(m => m.championLevel === 5).length}</p>
              <p className="text-neutral-600 text-[10px]">M5</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 flex flex-col sm:flex-row gap-3 flex-wrap"
      >
        <div className="relative flex-1 min-w-[200px]">
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
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900/80 border border-neutral-800/60 text-white text-sm placeholder-neutral-600
              focus:outline-none focus:border-[#C89B3C]/40 focus:ring-1 focus:ring-[#C89B3C]/20 transition backdrop-blur-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[null, 5, 6, 7].map((level) => (
            <motion.button
              key={level ?? 'all'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                selectedLevel === level
                  ? 'bg-[#C89B3C]/20 text-[#C89B3C] border border-[#C89B3C]/40 shadow-lg shadow-[#C89B3C]/5'
                  : 'bg-neutral-900/80 text-neutral-400 border border-neutral-800/60 hover:border-neutral-700 backdrop-blur-sm'
              }`}
            >
              {level === null ? t('all') : `M${level}+`}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map((opt) => (
            <motion.button
              key={opt.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy(opt.key)}
              className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                sortBy === opt.key
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                  : 'bg-neutral-900/80 text-neutral-400 border border-neutral-800/60 hover:border-neutral-700 backdrop-blur-sm'
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {sortedMasteries.length > 10 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAll(!showAll)}
          className="relative z-10 w-full py-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/60 text-neutral-400 text-sm hover:text-white hover:border-[#C89B3C]/30 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
        >
          <span>{showAll ? t('showLess') : t('showAll', { count: sortedMasteries.length })}</span>
          <motion.svg
            animate={{ rotate: showAll ? 180 : 0 }}
            className="w-4 h-4"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {displayMasteries.map((mastery, index) => (
            <ChampionCard
              key={mastery.championId}
              mastery={mastery}
              getName={getName}
              index={index}
              DDV={DDV}
              pointsLabel={t('points')}
              toNextLevelLabel={t('toNextLevel')}
            />
          ))}
        </AnimatePresence>
      </div>

      {showAll && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-neutral-500 text-sm relative z-10"
        >
          {t('showingAll', { count: displayMasteries.length })}
        </motion.p>
      )}
    </div>
  )
}
