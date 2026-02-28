'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getChampionsByLane, normalizeChampionName } from '@/lib/champion-lanes'
import SlotLever from './SlotLever'

interface Champion {
  id: string
  key: string | number
  name: string
  tags?: string[]
}

interface RouletteWheelProps {
  lane?: string
  onResult: (champion: Champion) => void
  disabled?: boolean
  rerollsUsed?: number
  maxRerolls?: number
}

const DDV = '14.9.1'
const SPLASH_BASE = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/'
const LOADING_BASE = 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/'

// Más lento que antes para que se vea elegante
const SPIN_MS = 6200
const CELL_W = 200
const CELL_H = 200

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export default function RouletteWheel({
  lane = 'all',
  onResult,
  disabled = false,
}: RouletteWheelProps) {

  const [allChampions, setAllChampions] = useState<Champion[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<Champion | null>(null)
  const [loadingChamps, setLoadingChamps] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const animRef = useRef<number>(0)

  const stripRef = useRef<Champion[]>([])
  const prevCellIndexRef = useRef(0)

  /* ───────── AUDIO POOL PARA TICKS ───────── */
  const audioPoolRef = useRef<HTMLAudioElement[]>([])
  const audioIndexRef = useRef(0)

  useEffect(() => {
    const pool: HTMLAudioElement[] = []
    for (let i = 0; i < 15; i++) {
      const audio = new Audio('/tick.m4a')
      audio.volume = 0.2
      pool.push(audio)
    }
    audioPoolRef.current = pool
  }, [])

  const playTick = () => {
    const pool = audioPoolRef.current
    if (!pool.length) return

    const audio = pool[audioIndexRef.current]
    audio.currentTime = 0
    audio.play().catch(() => {})
    audioIndexRef.current = (audioIndexRef.current + 1) % pool.length
  }

  /* ───────── LOAD CHAMPIONS ───────── */

  useEffect(() => {
    ; (async () => {
      setLoadingChamps(true)

      try {
        const res = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${DDV}/data/en_US/champion.json`
        )
        const json = await res.json()

        let pool: Champion[] = Object.values(json.data).map((c: any) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          tags: c.tags || []
        }))

        if (lane !== 'all') {
          const laneNames = getChampionsByLane(lane)

          pool = pool.filter(champ => {
            const normalized = normalizeChampionName(champ.name)
            return laneNames.some(l =>
              normalizeChampionName(l).toLowerCase() ===
              normalized.toLowerCase()
            )
          })
        }

        setAllChampions(pool.sort(() => Math.random() - 0.5))
      } catch (err) {
        console.error(err)
      }

      setLoadingChamps(false)
    })()
  }, [lane])

  /* ───────── PRELOAD IMAGES ───────── */

  useEffect(() => {
    if (!allChampions.length) return

    allChampions.forEach(c => {
      if (imagesRef.current.has(c.id)) return

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = `${LOADING_BASE}${c.id}_0.jpg`
      img.onload = () => imagesRef.current.set(c.id, img)
      img.onerror = () => {
        const splash = new Image()
        splash.crossOrigin = 'anonymous'
        splash.src = `${SPLASH_BASE}${c.id}_0.jpg`
        splash.onload = () => imagesRef.current.set(c.id, splash)
      }
    })
  }, [allChampions])

  /* ───────── DRAW ───────── */

  const draw = useCallback((offset: number, highlight: number | null = null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const strip = stripRef.current
    if (!strip.length) return

    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0b0b0e'
    ctx.fillRect(0, 0, W, H)

    const step = CELL_W
    const firstCell = Math.floor(offset / step) - 1
    const visibleCount = Math.ceil(W / step) + 3

    for (let ci = firstCell; ci < firstCell + visibleCount; ci++) {
      const idx = ((ci % strip.length) + strip.length) % strip.length
      const champ = strip[idx]

      const x = ci * step - offset
      const y = cy - CELL_H / 2
      const isWin = highlight !== null && idx === highlight

      ctx.fillStyle = isWin ? '#1c1600' : '#131317'
      ctx.beginPath()
      ctx.roundRect(x, y, CELL_W, CELL_H, 14)
      ctx.fill()

      const img = imagesRef.current.get(champ.id)

      if (img) {
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(x + 6, y + 6, CELL_W - 12, CELL_H - 12, 12)
        ctx.clip()

        const aspect = img.naturalWidth / img.naturalHeight
        const cellAspect = CELL_W / CELL_H

        let drawW, drawH, drawX, drawY

        if (aspect > cellAspect) {
          drawH = CELL_H
          drawW = drawH * aspect
          drawX = x - (drawW - CELL_W) / 2
          drawY = y
        } else {
          drawW = CELL_W
          drawH = drawW / aspect
          drawX = x
          drawY = y - (drawH - CELL_H) * 0.15
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        ctx.restore()
      }

      if (isWin) {
        const glow = 20 + Math.sin(performance.now() * 0.01) * 10

        ctx.shadowColor = '#C89B3C'
        ctx.shadowBlur = glow
        ctx.strokeStyle = '#C89B3C'
        ctx.lineWidth = 4

        ctx.beginPath()
        ctx.roundRect(x, y, CELL_W, CELL_H, 16)
        ctx.stroke()

        ctx.shadowBlur = 0
      }
    }

    const hw = CELL_W / 2
    ctx.strokeStyle = '#C89B3C'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 6])

    ctx.beginPath()
    ctx.moveTo(cx - hw, 0)
    ctx.lineTo(cx - hw, H)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(cx + hw, 0)
    ctx.lineTo(cx + hw, H)
    ctx.stroke()

    ctx.setLineDash([])
  }, [])

  /* ───────── SPIN ───────── */

  const spin = useCallback(() => {
  if (isSpinning || !allChampions.length || disabled) return

  setWinner(null)
  setIsSpinning(true)
  cancelAnimationFrame(animRef.current)
  
  prevCellIndexRef.current = 0

  const pool: Champion[] = []
  for (let i = 0; i < 8; i++) {
    pool.push(...[...allChampions].sort(() => Math.random() - 0.5))
  }
  stripRef.current = pool

  const canvas = canvasRef.current
  if (!canvas) return

  const cx = canvas.width / 2
  const mid = Math.floor(pool.length * 0.5)
  const winIdx = mid + Math.floor(Math.random() * 20)
  const finalOffset = winIdx * CELL_W + CELL_W / 2 - cx
  const start = performance.now()
  const winChamp = pool[winIdx]

  // 🔹 FORZAR TICK INICIAL
  playTick()

  const animate = (now: number) => {
    const t = Math.min((now - start) / SPIN_MS, 1)
    const eased = easeOutQuart(t)
    const offset = finalOffset * eased

    // 🔹 TICK POR CELDA CRUZADA
    const currentCellIndex = Math.floor(offset / CELL_W)
    const diff = currentCellIndex - prevCellIndexRef.current
    if (diff > 0) {
      for (let i = 0; i < diff; i++) playTick()
      prevCellIndexRef.current = currentCellIndex
    }

    if (t < 1) {
      draw(offset)
      animRef.current = requestAnimationFrame(animate)
    } else {
      draw(finalOffset, winIdx)
      playTick() // último tick final
      setIsSpinning(false)
      setWinner(winChamp)
      onResult({ ...winChamp, key: Number(winChamp.key) })
    }
  }

  animRef.current = requestAnimationFrame(animate)
}, [isSpinning, allChampions, disabled, draw, onResult])

  /* ───────── INIT STRIP ───────── */

  useEffect(() => {
    if (!allChampions.length) return
    const pool = [...allChampions, ...allChampions, ...allChampions]
    stripRef.current = pool
    setTimeout(() => draw(0), 300)
  }, [allChampions, draw])

  /* ───────── RESIZE ───────── */

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth ?? 700
      canvas.height = CELL_H + 40
      draw(0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draw])

  useEffect(() => () => cancelAnimationFrame(animRef.current), [])

  /* ───────── UI ───────── */

  return (
    <div className="w-full flex justify-center items-center relative">
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60">
          {/* Fade izquierdo */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-black to-transparent z-10" />
          {/* Fade derecho */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-black to-transparent z-10" />
          {/* Flecha central */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-[#C89B3C] drop-shadow-[0_0_8px_#C89B3C]" />
            <div className="w-[3px] h-8 bg-[#C89B3C] shadow-[0_0_10px_#C89B3C]" />
          </div>

          <canvas
            ref={canvasRef}
            className="block"
            style={{ width: "50vw", height: CELL_H + 40 }}
          />

          {winner && !isSpinning && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn">
              <div className="text-center">
                <p className="text-[#C89B3C] text-xs uppercase tracking-[0.4em] mb-4 opacity-80">
                  Your Champion
                </p>
                <h2 className="text-white text-5xl md:text-6xl font-extrabold
                             animate-winnerReveal
                             drop-shadow-[0_0_25px_#C89B3C]
                             tracking-wider">
                  {winner.name}
                </h2>
              </div>
            </div>
          )}

        </div>

        <div className="absolute top-1/2 -translate-y-1/2 left-full ml-6">
          <SlotLever
            onActivate={spin}
            disabled={isSpinning || loadingChamps || disabled}
          />
        </div>
      </div>
    </div>
  )
}