'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getChampionsByLane, normalizeChampionName } from '@/lib/champion-lanes'

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────
const DDV         = '14.9.1'
const SPLASH_BASE = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/'
const SPIN_MS     = 5200
const CELL_W      = 140
const CELL_H      = 100
const PAD         = 5

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export default function RouletteWheel({ 
  lane = 'all', 
  onResult, 
  disabled = false,
  rerollsUsed = 0,
  maxRerolls = 2
}: RouletteWheelProps) {
  const [allChampions, setAllChampions]     = useState<Champion[]>([])
  const [isSpinning, setIsSpinning]         = useState(false)
  const [winner, setWinner]                 = useState<Champion | null>(null)
  const [loadingChamps, setLoadingChamps]   = useState(true)

  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const imagesRef  = useRef<Map<string, HTMLImageElement>>(new Map())
  const animRef    = useRef<number>(0)

  // ── Estado del spin actual (todo en refs para no causar re-renders) ──────
  const stripRef   = useRef<Champion[]>([])   // cinta de este spin
  const winIdxRef  = useRef<number>(0)        // índice del ganador en la cinta
  const targetRef  = useRef<number>(0)        // offset final (ganador centrado)
  const t0Ref      = useRef<number>(0)        // timestamp inicio

  // ── 1. Cargar campeones filtrados por lane ──────────────────────────────
  useEffect(() => {
    ;(async () => {
      setLoadingChamps(true)
      try {
        // Cargar todos los campeones de Data Dragon
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDV}/data/en_US/champion.json`)
        const json = await res.json()
        
        let championPool: Champion[] = Object.values(json.data).map((c: any) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          tags: c.tags || []
        }))

        // Filtrar por lane usando el mapeo
        if (lane !== 'all') {
          const laneChampNames = getChampionsByLane(lane)
          console.log(`🎯 Filtering for lane: ${lane}`)
          console.log(`📋 Champions in lane: ${laneChampNames.length}`)
          
          championPool = championPool.filter(champ => {
            // Normalizar el nombre del campeón para comparar
            const normalized = normalizeChampionName(champ.name)
            const matches = laneChampNames.some(laneName => {
              const normalizedLaneName = normalizeChampionName(laneName)
              return normalized.toLowerCase() === normalizedLaneName.toLowerCase()
            })
            return matches
          })
          
          console.log(`✅ Filtered pool: ${championPool.length} champions`)
        }

        setAllChampions(championPool.sort(() => Math.random() - 0.5))
      } catch (err) {
        console.error('Error loading champions:', err)
      }
      setLoadingChamps(false)
    })()
  }, [lane])  // Re-cargar cuando cambie el lane

  // ── 2. Precargar splash arts ─────────────────────────────────────────────
  useEffect(() => {
    if (allChampions.length === 0) return
    allChampions.forEach(c => {
      if (imagesRef.current.has(c.id)) return
      const img    = new Image()
      img.crossOrigin = 'anonymous'
      img.src      = `${SPLASH_BASE}${c.id}_0.jpg`
      img.onload   = () => imagesRef.current.set(c.id, img)
    })
  }, [allChampions])

  // ── 3. Función de dibujo ─────────────────────────────────────────────────
  //
  // CLAVE: offset SIEMPRE es relativo al inicio de la cinta ACTUAL (stripRef).
  // En cada spin reiniciamos offset a 0. Así el índice centrado es siempre
  //   centeredIdx = floor((offset + cx - (CELL_W+PAD)/2) / (CELL_W+PAD))
  //
  const draw = useCallback((offset: number, highlight: number | null = null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx    = canvas.getContext('2d')
    if (!ctx) return
    const strip  = stripRef.current
    if (!strip.length) return

    const W    = canvas.width
    const H    = canvas.height
    const step = CELL_W + PAD
    const cy   = H / 2

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0b0b0e'
    ctx.fillRect(0, 0, W, H)

    // ── Celdas ──────────────────────────────────────────────────────────
    const firstCell = Math.floor(offset / step)
    const count     = Math.ceil(W / step) + 2

    for (let ci = firstCell; ci < firstCell + count; ci++) {
      const idx   = ((ci % strip.length) + strip.length) % strip.length
      const champ = strip[idx]
      const x     = ci * step - offset
      const y     = cy - CELL_H / 2
      const isWin = highlight !== null && idx === highlight

      // Fondo
      ctx.fillStyle = isWin ? '#1c1600' : '#131317'
      ctx.beginPath()
      ctx.roundRect(x + PAD, y, CELL_W - PAD, CELL_H, 8)
      ctx.fill()

      // Splash art
      const img = imagesRef.current.get(champ.id)
      const ih  = CELL_H - 18   // altura reservada para la imagen
      if (img) {
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(x + PAD, y, CELL_W - PAD, ih, 8)
        ctx.clip()
        // Zoom-crop: mostramos la parte superior del splash (donde está la cara)
        const scale = Math.max((CELL_W - PAD) / img.naturalWidth, ih / img.naturalHeight)
        const sw    = (CELL_W - PAD) / scale
        const sh    = ih / scale
        const sx    = (img.naturalWidth  - sw) / 2
        const sy    = (img.naturalHeight - sh) * 0.12
        ctx.drawImage(img, sx, sy, sw, sh, x + PAD, y, CELL_W - PAD, ih)
        ctx.restore()
      } else {
        ctx.fillStyle = '#22222a'
        ctx.beginPath()
        ctx.roundRect(x + PAD, y, CELL_W - PAD, ih, 8)
        ctx.fill()
        ctx.fillStyle    = '#444'
        ctx.font         = 'bold 22px sans-serif'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(champ.name[0] ?? '?', x + PAD + (CELL_W - PAD) / 2, y + ih / 2)
        ctx.textBaseline = 'alphabetic'
      }

      // Nombre
      ctx.fillStyle = isWin ? '#C89B3C' : '#555'
      ctx.font      = `${isWin ? 'bold ' : ''}9px "Segoe UI", Arial, sans-serif`
      ctx.textAlign = 'center'
      const label   = champ.name.length > 13 ? champ.name.slice(0, 12) + '…' : champ.name
      ctx.fillText(label, x + PAD + (CELL_W - PAD) / 2, y + CELL_H - 3)

      // Borde dorado ganador
      if (isWin) {
        ctx.shadowColor = '#C89B3C'
        ctx.shadowBlur  = 16
        ctx.strokeStyle = '#C89B3C'
        ctx.lineWidth   = 2
        ctx.beginPath()
        ctx.roundRect(x + PAD, y, CELL_W - PAD, CELL_H, 8)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }

    // ── Fades laterales ──────────────────────────────────────────────────
    const fw = 110
    const lg = ctx.createLinearGradient(0, 0, fw, 0)
    lg.addColorStop(0, 'rgba(11,11,14,1)')
    lg.addColorStop(1, 'rgba(11,11,14,0)')
    ctx.fillStyle = lg
    ctx.fillRect(0, 0, fw, H)

    const rg = ctx.createLinearGradient(W - fw, 0, W, 0)
    rg.addColorStop(0, 'rgba(11,11,14,0)')
    rg.addColorStop(1, 'rgba(11,11,14,1)')
    ctx.fillStyle = rg
    ctx.fillRect(W - fw, 0, fw, H)

    // ── Marcador central ─────────────────────────────────────────────────
    const cx = W / 2
    const hw = (CELL_W - PAD) / 2

    ctx.strokeStyle = '#C89B3C'
    ctx.lineWidth   = 1.5
    ctx.setLineDash([3, 5])
    ctx.beginPath(); ctx.moveTo(cx - hw, 0); ctx.lineTo(cx - hw, H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + hw, 0); ctx.lineTo(cx + hw, H); ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#C89B3C'
    ctx.beginPath(); ctx.moveTo(cx - 9, 0); ctx.lineTo(cx + 9, 0); ctx.lineTo(cx, 14); ctx.closePath(); ctx.fill()
    ctx.beginPath(); ctx.moveTo(cx - 9, H); ctx.lineTo(cx + 9, H); ctx.lineTo(cx, H - 14); ctx.closePath(); ctx.fill()
  }, [])

  // ── 4. SPIN ──────────────────────────────────────────────────────────────
  const spin = useCallback(() => {
    if (isSpinning || allChampions.length === 0 || disabled) return

    setWinner(null)
    setIsSpinning(true)
    cancelAnimationFrame(animRef.current)

    // Construir cinta nueva cada spin (8 copias mezcladas)
    const pool: Champion[] = []
    for (let i = 0; i < 8; i++) {
      pool.push(...[...allChampions].sort(() => Math.random() - 0.5))
    }
    stripRef.current = pool

    const canvas = canvasRef.current
    if (!canvas) { setIsSpinning(false); return }

    const W    = canvas.width
    const step = CELL_W + PAD
    const cx   = W / 2

    // Elegir índice ganador en la mitad de la cinta
    const mid    = Math.floor(pool.length * 0.4)
    const winIdx = mid + Math.floor(Math.random() * Math.floor(pool.length * 0.2))
    winIdxRef.current = winIdx

    // Offset final: el centro de la celda winIdx coincide con cx
    // cx = winIdx * step + step/2 - finalOffset
    // → finalOffset = winIdx * step + step/2 - cx
    const finalOffset = winIdx * step + step / 2 - cx
    targetRef.current = finalOffset

    t0Ref.current = performance.now()

    const winChamp = pool[winIdx]

    // Loop de animación — offset siempre parte de 0
    const animate = (now: number) => {
      const t     = Math.min((now - t0Ref.current) / SPIN_MS, 1)
      const eased = easeOutQuart(t)
      const off   = finalOffset * eased

      if (t < 1) {
        draw(off)
        animRef.current = requestAnimationFrame(animate)
      } else {
        // Frame final: posición exacta + highlight
        draw(finalOffset, winIdx)
        setIsSpinning(false)
        setWinner(winChamp)
        // Convertir key a número para la verificación
        onResult({
          ...winChamp,
          key: Number(winChamp.key)
        })
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }, [isSpinning, allChampions, disabled, draw, onResult])

  // ── 5. Frame inicial (cinta estática) ───────────────────────────────────
  useEffect(() => {
    if (allChampions.length === 0) return
    const pool = [...allChampions, ...allChampions, ...allChampions]
      .sort(() => Math.random() - 0.5)
    stripRef.current = pool
    const id = setTimeout(() => draw(0), 500)
    return () => clearTimeout(id)
  }, [allChampions, draw])

  // ── 6. Resize ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width  = canvas.parentElement?.clientWidth ?? 700
      canvas.height = CELL_H + 30
      if (stripRef.current.length > 0) draw(0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draw])

  useEffect(() => () => cancelAnimationFrame(animRef.current), [])

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col items-center gap-5">

      {/* Strip */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-800/70 shadow-2xl shadow-black/60">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />

        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ height: CELL_H + 30 }}
        />

        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />

        {loadingChamps && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0b0e]/95">
            <div className="flex items-center gap-3 text-[#C89B3C]">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-semibold tracking-[0.15em]">Loading champions…</span>
            </div>
          </div>
        )}
      </div>

      {/* Reroll counter (si hay rerolls usados) */}
      {rerollsUsed > 0 && (
        <div className="w-full max-w-xs flex items-center justify-center gap-2 mb-2">
          <span className="text-neutral-400 text-sm">Rerolls:</span>
          <div className="flex gap-1">
            {[...Array(maxRerolls + 1)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < rerollsUsed 
                    ? 'bg-[#C89B3C]' 
                    : 'bg-neutral-700'
                }`}
              />
            ))}
          </div>
          <span className="text-neutral-500 text-xs">
            ({rerollsUsed}/{maxRerolls + 1})
          </span>
        </div>
      )}

      {/* Champion pool indicator */}
      {!loadingChamps && allChampions.length > 0 && (
        <div className="w-full max-w-xs flex items-center justify-center gap-2 mb-2">
          <span className="text-neutral-500 text-xs">
            {allChampions.length} champion{allChampions.length !== 1 ? 's' : ''} in pool
          </span>
        </div>
      )}

      {/* Botón SPIN */}
      <button
        onClick={spin}
        disabled={isSpinning || loadingChamps || disabled}
        className={`
          relative w-full max-w-xs py-4 rounded-xl font-bold
          tracking-[0.12em] uppercase text-sm
          transition-all duration-200 overflow-hidden
          ${(isSpinning || disabled)
            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            : 'bg-[#C89B3C] text-neutral-950 hover:bg-[#d9aa44] active:scale-[0.97] shadow-lg shadow-[#C89B3C]/25'
          }
        `}
      >
        {isSpinning
          ? <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Spinning…
            </span>
          : <>
              {rerollsUsed > 0 && rerollsUsed <= maxRerolls 
                ? `Reroll (${maxRerolls + 1 - rerollsUsed} left)` 
                : 'Spin the Wheel'}
              <span className="absolute inset-0 -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            </>
        }
      </button>

      {/* Tarjeta ganadora */}
      {winner && !isSpinning && (
        <div
          key={winner.id + Math.random()}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl
                     border border-[#C89B3C]/40 bg-[#0f0f11]"
          style={{ animation: 'fadeSlideUp 0.4s ease-out' }}
        >
          <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-[#C89B3C] shadow-lg shadow-[#C89B3C]/20">
            <img
              src={`${SPLASH_BASE}${winner.id}_0.jpg`}
              alt={winner.name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[#C89B3C] text-[10px] font-bold tracking-[0.25em] uppercase mb-1">Your champion</p>
            <p className="text-white text-2xl font-bold leading-tight truncate">{winner.name}</p>
          </div>

          <button
            onClick={spin}
            disabled={disabled}
            title="Spin again"
            className="ml-auto flex-shrink-0 p-2.5 rounded-xl bg-neutral-800
                       hover:bg-neutral-700 text-neutral-400 hover:text-white
                       transition disabled:opacity-40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}