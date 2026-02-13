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

interface SlotMachineRouletteProps {
  lane?: string
  onResult: (champion: Champion) => void
  disabled?: boolean
  rerollsUsed?: number
  maxRerolls?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────
const DDV          = '14.9.1'
const SPLASH_BASE  = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/'
const LOADING_BASE = 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/'

const CELL_SIZE    = 120        // tamaño de cada celda
const VISIBLE_ROWS = 3          // filas visibles por columna
const SPIN_DURATION = 3500      // duración total (ms)
const COLUMNS = 3               // número de columnas

// Delays progresivos para cada columna (efecto cascada)
const COLUMN_DELAYS = [0, 400, 800]

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export default function SlotMachineRoulette({ 
  lane = 'all', 
  onResult, 
  disabled = false,
  rerollsUsed = 0,
  maxRerolls = 2
}: SlotMachineRouletteProps) {
  const [allChampions, setAllChampions] = useState<Champion[]>([])
  const [isSpinning, setIsSpinning]     = useState(false)
  const [winner, setWinner]             = useState<Champion | null>(null)
  const [loadingChamps, setLoadingChamps] = useState(true)

  // Refs para cada columna
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null])
  const imagesRef  = useRef<Map<string, HTMLImageElement>>(new Map())
  const animRefs   = useRef<number[]>([0, 0, 0])

  // Estado de cada columna
  const stripsRef  = useRef<Champion[][]>([[], [], []])
  const winnersRef = useRef<Champion[]>([])
  const offsetsRef = useRef<number[]>([0, 0, 0])

  // ── 1. Cargar campeones filtrados por lane ──────────────────────────────
  useEffect(() => {
    ;(async () => {
      setLoadingChamps(true)
      try {
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDV}/data/en_US/champion.json`)
        const json = await res.json()
        
        let championPool: Champion[] = Object.values(json.data).map((c: any) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          tags: c.tags || []
        }))

        if (lane !== 'all') {
          const laneChampNames = getChampionsByLane(lane)
          championPool = championPool.filter(champ => {
            const normalized = normalizeChampionName(champ.name)
            return laneChampNames.some(laneName => 
              normalizeChampionName(laneName).toLowerCase() === normalized.toLowerCase()
            )
          })
        }

        setAllChampions(championPool.sort(() => Math.random() - 0.5))
      } catch (err) {
        console.error('Error loading champions:', err)
      }
      setLoadingChamps(false)
    })()
  }, [lane])

  // ── 2. Precargar imágenes (loading screens - mejor calidad) ─────────────
  useEffect(() => {
    if (allChampions.length === 0) return
    allChampions.forEach(c => {
      if (imagesRef.current.has(c.id)) return
      const img = new Image()
      img.crossOrigin = 'anonymous'
      // Usar loading screens - mejor calidad que splash
      img.src = `${LOADING_BASE}${c.id}_0.jpg`
      img.onload = () => imagesRef.current.set(c.id, img)
      img.onerror = () => {
        // Fallback a splash si loading falla
        const splash = new Image()
        splash.crossOrigin = 'anonymous'
        splash.src = `${SPLASH_BASE}${c.id}_0.jpg`
        splash.onload = () => imagesRef.current.set(c.id, splash)
      }
    })
  }, [allChampions])

  // ── 3. Función de dibujo para una columna ───────────────────────────────
  const drawColumn = useCallback((colIndex: number, offset: number, highlight: boolean = false) => {
    const canvas = canvasRefs.current[colIndex]
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const strip = stripsRef.current[colIndex]
    if (!strip.length) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Fondo degradado
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#0a0a0d')
    bgGrad.addColorStop(0.5, '#12121a')
    bgGrad.addColorStop(1, '#0a0a0d')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Calcular qué celdas dibujar
    const firstCell = Math.floor(offset / CELL_SIZE)
    const drawCount = VISIBLE_ROWS + 2

    for (let i = firstCell; i < firstCell + drawCount; i++) {
      const idx = ((i % strip.length) + strip.length) % strip.length
      const champ = strip[idx]
      const y = i * CELL_SIZE - offset
      const centerY = H / 2

      // Solo dibujar si está visible
      if (y + CELL_SIZE < -20 || y > H + 20) continue

      const isCenter = Math.abs(y + CELL_SIZE / 2 - centerY) < CELL_SIZE / 2

      // Fondo de celda
      ctx.fillStyle = isCenter && highlight ? '#1a1600' : '#0f0f14'
      ctx.beginPath()
      ctx.roundRect(8, y + 4, W - 16, CELL_SIZE - 8, 12)
      ctx.fill()

      // Imagen del campeón
      const img = imagesRef.current.get(champ.id)
      if (img) {
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(12, y + 8, W - 24, CELL_SIZE - 32, 10)
        ctx.clip()
        
        // Dibujar imagen centrada y recortada
        const imgAspect = img.naturalWidth / img.naturalHeight
        const cellAspect = (W - 24) / (CELL_SIZE - 32)
        
        let drawW, drawH, drawX, drawY
        if (imgAspect > cellAspect) {
          drawH = CELL_SIZE - 32
          drawW = drawH * imgAspect
          drawX = 12 - (drawW - (W - 24)) / 2
          drawY = y + 8
        } else {
          drawW = W - 24
          drawH = drawW / imgAspect
          drawX = 12
          drawY = y + 8 - (drawH - (CELL_SIZE - 32)) / 2
        }
        
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        ctx.restore()
      } else {
        // Placeholder
        ctx.fillStyle = '#1a1a22'
        ctx.beginPath()
        ctx.roundRect(12, y + 8, W - 24, CELL_SIZE - 32, 10)
        ctx.fill()
        
        ctx.fillStyle = '#444'
        ctx.font = 'bold 32px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(champ.name[0] || '?', W / 2, y + CELL_SIZE / 2 - 8)
      }

      // Nombre
      ctx.fillStyle = isCenter && highlight ? '#C89B3C' : '#666'
      ctx.font = `${isCenter && highlight ? 'bold ' : ''}11px "Segoe UI", Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      const label = champ.name.length > 12 ? champ.name.slice(0, 11) + '…' : champ.name
      ctx.fillText(label, W / 2, y + CELL_SIZE - 8)

      // Borde dorado si es centro y highlight
      if (isCenter && highlight) {
        ctx.shadowColor = '#C89B3C'
        ctx.shadowBlur = 20
        ctx.strokeStyle = '#C89B3C'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(8, y + 4, W - 16, CELL_SIZE - 8, 12)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }

    // Overlays arriba y abajo
    const fadeH = 60
    const topGrad = ctx.createLinearGradient(0, 0, 0, fadeH)
    topGrad.addColorStop(0, 'rgba(10,10,13,1)')
    topGrad.addColorStop(1, 'rgba(10,10,13,0)')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, W, fadeH)

    const botGrad = ctx.createLinearGradient(0, H - fadeH, 0, H)
    botGrad.addColorStop(0, 'rgba(10,10,13,0)')
    botGrad.addColorStop(1, 'rgba(10,10,13,1)')
    ctx.fillStyle = botGrad
    ctx.fillRect(0, H - fadeH, W, fadeH)

    // Marcador central
    if (highlight) {
      const cy = H / 2
      ctx.strokeStyle = '#C89B3C80'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(0, cy - CELL_SIZE / 2)
      ctx.lineTo(W, cy - CELL_SIZE / 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, cy + CELL_SIZE / 2)
      ctx.lineTo(W, cy + CELL_SIZE / 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [])

  // ── 4. SPIN ──────────────────────────────────────────────────────────────
  const spin = useCallback(() => {
    if (isSpinning || allChampions.length === 0 || disabled) return

    setWinner(null)
    setIsSpinning(true)

    // Limpiar animaciones anteriores
    animRefs.current.forEach(id => cancelAnimationFrame(id))

    // Construir strips para cada columna
    const strips: Champion[][] = []
    const winners: Champion[] = []

    for (let col = 0; col < COLUMNS; col++) {
      const pool: Champion[] = []
      for (let i = 0; i < 10; i++) {
        pool.push(...[...allChampions].sort(() => Math.random() - 0.5))
      }
      strips[col] = pool

      // Elegir ganador para esta columna
      const mid = Math.floor(pool.length * 0.4)
      const winIdx = mid + Math.floor(Math.random() * Math.floor(pool.length * 0.2))
      winners[col] = pool[winIdx]

      stripsRef.current[col] = pool
      winnersRef.current = winners
      offsetsRef.current[col] = 0
    }

    // Animar cada columna con delay
    strips.forEach((strip, colIndex) => {
      const canvas = canvasRefs.current[colIndex]
      if (!canvas) return

      const H = canvas.height
      const centerY = H / 2

      // Calcular offset final para centrar ganador
      const winnerIdx = strip.indexOf(winners[colIndex])
      const finalOffset = winnerIdx * CELL_SIZE - centerY + CELL_SIZE / 2

      const startTime = performance.now() + COLUMN_DELAYS[colIndex]
      const duration = SPIN_DURATION

      const animate = (now: number) => {
        const elapsed = now - startTime
        
        if (elapsed < 0) {
          // Aún en delay
          drawColumn(colIndex, 0, false)
          animRefs.current[colIndex] = requestAnimationFrame(animate)
          return
        }

        const t = Math.min(elapsed / duration, 1)
        const eased = easeOutQuart(t)
        offsetsRef.current[colIndex] = finalOffset * eased

        if (t < 1) {
          drawColumn(colIndex, offsetsRef.current[colIndex], false)
          animRefs.current[colIndex] = requestAnimationFrame(animate)
        } else {
          // Terminado
          offsetsRef.current[colIndex] = finalOffset
          drawColumn(colIndex, finalOffset, true)

          // Si es la última columna, terminar spin
          if (colIndex === COLUMNS - 1) {
            setTimeout(() => {
              setIsSpinning(false)
              // Todos los ganadores son iguales (el del medio)
              const finalWinner = winners[1]
              setWinner(finalWinner)
              onResult({
                ...finalWinner,
                key: Number(finalWinner.key)
              })
            }, 300)
          }
        }
      }

      animRefs.current[colIndex] = requestAnimationFrame(animate)
    })
  }, [isSpinning, allChampions, disabled, drawColumn, onResult])

  // ── 5. Frame inicial ─────────────────────────────────────────────────────
  useEffect(() => {
    if (allChampions.length === 0) return
    
    // Inicializar strips con campeones mezclados
    for (let col = 0; col < COLUMNS; col++) {
      const pool = [...allChampions, ...allChampions, ...allChampions]
        .sort(() => Math.random() - 0.5)
      stripsRef.current[col] = pool
    }

    const id = setTimeout(() => {
      for (let col = 0; col < COLUMNS; col++) {
        drawColumn(col, 0, false)
      }
    }, 500)
    return () => clearTimeout(id)
  }, [allChampions, drawColumn])

  // ── 6. Resize ────────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      canvasRefs.current.forEach((canvas, idx) => {
        if (!canvas) return
        canvas.width = 140
        canvas.height = VISIBLE_ROWS * CELL_SIZE + 40
        if (stripsRef.current[idx].length > 0) {
          drawColumn(idx, offsetsRef.current[idx], false)
        }
      })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [drawColumn])

  useEffect(() => {
    return () => animRefs.current.forEach(id => cancelAnimationFrame(id))
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col items-center gap-5">

      {/* Slot Machine Container */}
      <div className="relative w-full max-w-2xl">
        
        {/* Top decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent mb-4" />

        {/* Slot machine body */}
        <div className="relative bg-gradient-to-b from-[#1a1a22] to-[#0f0f14] rounded-3xl p-6 border-2 border-[#C89B3C]/30 shadow-2xl">
          
          {/* Columns container */}
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(colIdx => (
              <div key={colIdx} className="relative">
                <div className="relative rounded-2xl overflow-hidden border-2 border-neutral-800/80 bg-[#0a0a0d] shadow-inner">
                  <canvas
                    ref={el => { canvasRefs.current[colIdx] = el }}
                    className="block w-full"
                    style={{ height: VISIBLE_ROWS * CELL_SIZE + 40 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Loading overlay */}
          {loadingChamps && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f14]/95 rounded-3xl">
              <div className="flex items-center gap-3 text-[#C89B3C]">
                <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-semibold tracking-wider">Loading champions…</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent mt-4" />
      </div>

      {/* Reroll counter */}
      {rerollsUsed > 0 && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-neutral-400 text-sm">Rerolls:</span>
          <div className="flex gap-1">
            {[...Array(maxRerolls + 1)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < rerollsUsed ? 'bg-[#C89B3C]' : 'bg-neutral-700'
                }`}
              />
            ))}
          </div>
          <span className="text-neutral-500 text-xs">({rerollsUsed}/{maxRerolls + 1})</span>
        </div>
      )}

      {/* Champion count */}
      {!loadingChamps && allChampions.length > 0 && (
        <div className="text-neutral-500 text-xs">
          {allChampions.length} champion{allChampions.length !== 1 ? 's' : ''} in pool
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
            : 'bg-[#C89B3C] text-neutral-950 hover:bg-[#d9aa44] active:scale-[0.97] shadow-lg shadow-[#C89B3C]/30'
          }
        `}
      >
        {isSpinning ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Spinning…
          </span>
        ) : (
          <>
            {rerollsUsed > 0 && rerollsUsed <= maxRerolls 
              ? `Reroll (${maxRerolls + 1 - rerollsUsed} left)` 
              : 'Spin the Slots'}
            <span className="absolute inset-0 -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          </>
        )}
      </button>

      {/* Winner card */}
      {winner && !isSpinning && (
        <div
          key={winner.id + Math.random()}
          className="w-full max-w-xl flex items-center gap-4 px-6 py-5 rounded-2xl
                     border-2 border-[#C89B3C]/60 bg-gradient-to-br from-[#1a1600]/80 to-[#0f0f11]
                     shadow-xl shadow-[#C89B3C]/20"
          style={{ animation: 'fadeSlideUp 0.5s ease-out' }}
        >
          <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-[#C89B3C] shadow-lg">
            <img
              src={`${LOADING_BASE}${winner.id}_0.jpg`}
              alt={winner.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `${SPLASH_BASE}${winner.id}_0.jpg`
              }}
            />
            <div className="absolute inset-0 rounded-xl ring-2 ring-[#C89B3C]/40 ring-inset" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[#C89B3C] text-xs font-bold tracking-[0.3em] uppercase mb-1">
              🎰 Jackpot!
            </p>
            <p className="text-white text-3xl font-bold leading-tight truncate">
              {winner.name}
            </p>
          </div>

          <button
            onClick={spin}
            disabled={disabled}
            title="Spin again"
            className="flex-shrink-0 p-3 rounded-xl bg-neutral-800/80
                       hover:bg-neutral-700 text-neutral-400 hover:text-white
                       transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}