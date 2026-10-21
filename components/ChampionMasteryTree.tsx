'use client'

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import Cookies from 'js-cookie'
import { Crosshair, Minus, Move, Plus, Search, X } from 'lucide-react'
import { buildMasteryTreeLayout } from '@/lib/mastery-tree/layout'
import type {
  ChampionMetaMap,
  MasteryEntry,
  MasteryTreeNode,
} from '@/lib/mastery-tree/types'
import { championIconUrl, loadChampionData } from '@/lib/champion-data'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4.5

const LEVEL_STYLES: Record<number, { color: string; soft: string }> = {
  1: { color: '#b6a58a', soft: 'rgba(182, 165, 138, 0.18)' },
  2: { color: '#c69a63', soft: 'rgba(198, 154, 99, 0.18)' },
  3: { color: '#d8a65a', soft: 'rgba(216, 166, 90, 0.2)' },
  4: { color: '#9fb0c8', soft: 'rgba(159, 176, 200, 0.18)' },
  5: { color: '#38bdf8', soft: 'rgba(56, 189, 248, 0.2)' },
  6: { color: '#c084fc', soft: 'rgba(192, 132, 252, 0.22)' },
  7: { color: '#f0c75e', soft: 'rgba(240, 199, 94, 0.24)' },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getLevelStyle(level: number) {
  return LEVEL_STYLES[clamp(Math.round(level), 1, 7)] ?? LEVEL_STYLES[1]
}

function getViewBoxPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const point = svg.createSVGPoint()
  point.x = clientX
  point.y = clientY
  const matrix = svg.getScreenCTM()
  if (!matrix) return { x: 0, y: 0 }
  return point.matrixTransform(matrix.inverse())
}

function getPointerDistance(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return 0
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
}

async function fetchMastery(
  token: string,
  puuid: string,
  region: string,
): Promise<MasteryEntry[]> {
  const response = await fetch('/api/champion-mastery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ puuid, region }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Could not load champion mastery')
  }

  return payload?.masteries ?? []
}

interface ChampionMasteryTreeProps {
  puuid: string
  region: string
}

export default function ChampionMasteryTree({
  puuid,
  region,
}: ChampionMasteryTreeProps) {
  const t = useTranslations('masteryTree')
  const tm = useTranslations('championMastery')
  const locale = useLocale()

  const containerRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const [masteries, setMasteries] = useState<MasteryEntry[] | null>(null)
  const [championMeta, setChampionMeta] = useState<ChampionMetaMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const viewRef = useRef(view)
  const animationRef = useRef<number | null>(null)
  const [interacting, setInteracting] = useState(false)

  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const pinchRef = useRef<{ distance: number } | null>(null)
  const didDragRef = useRef(false)

  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])
  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    [locale],
  )
  const percentageFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
      }),
    [locale],
  )

  useEffect(() => {
    viewRef.current = view
  }, [view])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const token = Cookies.get('session_token')
        if (!token) throw new Error('Unauthorized')

        const [meta, entries] = await Promise.all([
          loadChampionData().catch(() => ({}) as ChampionMetaMap),
          fetchMastery(token, puuid, region),
        ])

        if (cancelled) return
        setChampionMeta(meta)
        setMasteries(entries)
      } catch (loadError) {
        if (cancelled) return
        setError(
          loadError instanceof Error && loadError.message !== 'Unauthorized'
            ? loadError.message
            : t('loadError'),
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [puuid, region, loadAttempt, t])

  const layout = useMemo(() => {
    if (!masteries) return null
    return buildMasteryTreeLayout(
      masteries,
      championMeta,
      `${region}:${puuid}:${masteries.length}`,
    )
  }, [masteries, championMeta, puuid, region])

  const nodes = useMemo(() => layout?.nodes ?? [], [layout])
  const totalPoints = layout?.totalPoints ?? 0
  const masterySevenCount = useMemo(
    () => nodes.filter((node) => node.level >= 7).length,
    [nodes],
  )

  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const searchActive = normalizedQuery.length > 0
  const matches = useMemo(() => {
    if (!searchActive) return []
    return nodes.filter((node) => {
      const haystack = `${node.name} ${node.championKey}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [nodes, normalizedQuery, searchActive])
  const matchIds = useMemo(
    () => new Set(matches.map((node) => node.id)),
    [matches],
  )

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? null,
    [nodes, selectedId],
  )
  const hoveredNode = useMemo(
    () => nodes.find((node) => node.id === hoveredId) ?? null,
    [nodes, hoveredId],
  )

  const orderedNodes = useMemo(() => [...nodes].reverse(), [nodes])

  const cancelViewAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const animateToView = useCallback(
    (target: { x: number; y: number; k: number }) => {
      cancelViewAnimation()
      const start = viewRef.current
      const startedAt = performance.now()
      const duration = 520

      const step = (now: number) => {
        const progress = clamp((now - startedAt) / duration, 0, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const next = {
          x: start.x + (target.x - start.x) * eased,
          y: start.y + (target.y - start.y) * eased,
          k: start.k + (target.k - start.k) * eased,
        }
        viewRef.current = next
        setView(next)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step)
        } else {
          animationRef.current = null
        }
      }

      animationRef.current = requestAnimationFrame(step)
    },
    [cancelViewAnimation],
  )

  useEffect(() => () => cancelViewAnimation(), [cancelViewAnimation])

  const getViewBoxPointFromClient = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    return getViewBoxPoint(svg, clientX, clientY)
  }, [])

  const zoomAtCenter = useCallback(
    (factor: number) => {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const focal = getViewBoxPointFromClient(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      )
      const current = viewRef.current
      const nextScale = clamp(current.k * factor, MIN_ZOOM, MAX_ZOOM)
      const worldX = (focal.x - current.x) / current.k
      const worldY = (focal.y - current.y) / current.k

      animateToView({
        k: nextScale,
        x: focal.x - worldX * nextScale,
        y: focal.y - worldY * nextScale,
      })
    },
    [animateToView, getViewBoxPointFromClient],
  )

  const resetView = useCallback(() => {
    animateToView({ x: 0, y: 0, k: 1 })
  }, [animateToView])

  const focusChampion = useCallback(
    (node: MasteryTreeNode) => {
      const nextScale = clamp(Math.max(1.3, viewRef.current.k), MIN_ZOOM, 2.4)
      animateToView({
        k: nextScale,
        x: -node.x * nextScale,
        y: -node.y * nextScale,
      })
    },
    [animateToView],
  )

  const selectNode = useCallback((node: MasteryTreeNode) => {
    setSelectedId(node.id)
    setHoveredId(null)
    setTooltip(null)
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      cancelViewAnimation()

      const focal = getViewBoxPoint(svg, event.clientX, event.clientY)
      setView((previous) => {
        const nextScale = clamp(
          previous.k * Math.exp(-event.deltaY * 0.0014),
          MIN_ZOOM,
          MAX_ZOOM,
        )
        const worldX = (focal.x - previous.x) / previous.k
        const worldY = (focal.y - previous.y) / previous.k
        return {
          k: nextScale,
          x: focal.x - worldX * nextScale,
          y: focal.y - worldY * nextScale,
        }
      })
    }

    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [cancelViewAnimation])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!pointersRef.current.has(event.pointerId)) return

      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      })

      const pointerCount = pointersRef.current.size
      const svg = svgRef.current
      if (!svg) return

      if (pointerCount === 1 && lastPointerRef.current) {
        const previous = lastPointerRef.current
        const from = getViewBoxPoint(svg, previous.x, previous.y)
        const to = getViewBoxPoint(svg, event.clientX, event.clientY)
        const screenDistance = Math.hypot(
          event.clientX - previous.x,
          event.clientY - previous.y,
        )

        if (screenDistance > 1.5) didDragRef.current = true

        setView((current) => ({
          ...current,
          x: current.x + (to.x - from.x),
          y: current.y + (to.y - from.y),
        }))
        lastPointerRef.current = { x: event.clientX, y: event.clientY }
        return
      }

      if (pointerCount >= 2) {
        const points = Array.from(pointersRef.current.values())
        const distance = getPointerDistance(points)
        const midpoint = {
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2,
        }
        const focal = getViewBoxPoint(svg, midpoint.x, midpoint.y)
        const previousPinch = pinchRef.current

        if (previousPinch && previousPinch.distance > 0) {
          const factor = distance / previousPinch.distance
          if (Math.abs(distance - previousPinch.distance) > 1.5) {
            didDragRef.current = true
          }

          setView((current) => {
            const nextScale = clamp(current.k * factor, MIN_ZOOM, MAX_ZOOM)
            const worldX = (focal.x - current.x) / current.k
            const worldY = (focal.y - current.y) / current.k
            return {
              k: nextScale,
              x: focal.x - worldX * nextScale,
              y: focal.y - worldY * nextScale,
            }
          })
        }

        pinchRef.current = { distance }
      }
    }

    const releasePointer = (event: PointerEvent) => {
      if (!pointersRef.current.has(event.pointerId)) return
      pointersRef.current.delete(event.pointerId)

      if (pointersRef.current.size === 0) {
        lastPointerRef.current = null
        pinchRef.current = null
        setInteracting(false)
        return
      }

      if (pointersRef.current.size === 1) {
        const remaining = Array.from(pointersRef.current.values())[0]
        lastPointerRef.current = { x: remaining.x, y: remaining.y }
        pinchRef.current = null
      } else {
        pinchRef.current = {
          distance: getPointerDistance(Array.from(pointersRef.current.values())),
        }
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', releasePointer)
    window.addEventListener('pointercancel', releasePointer)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', releasePointer)
      window.removeEventListener('pointercancel', releasePointer)
    }
  }, [])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      cancelViewAnimation()
      didDragRef.current = false
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      })
      setInteracting(true)
      setTooltip(null)

      if (pointersRef.current.size === 1) {
        lastPointerRef.current = { x: event.clientX, y: event.clientY }
        pinchRef.current = null
      } else {
        lastPointerRef.current = null
        pinchRef.current = {
          distance: getPointerDistance(Array.from(pointersRef.current.values())),
        }
      }
    },
    [cancelViewAnimation],
  )

  const handleNodeEnter = useCallback(
    (node: MasteryTreeNode, event: ReactPointerEvent<SVGGElement>) => {
      if (interacting || event.pointerType !== 'mouse') return
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      setHoveredId(node.id)
      setTooltip({
        x: clamp(event.clientX - rect.left, 124, Math.max(124, rect.width - 124)),
        y: clamp(event.clientY - rect.top, 92, Math.max(92, rect.height - 20)),
      })
    },
    [interacting],
  )

  const handleNodeLeave = useCallback(() => {
    setHoveredId(null)
    setTooltip(null)
  }, [])

  const handleNodeClick = useCallback(
    (node: MasteryTreeNode, event: ReactMouseEvent<SVGGElement>) => {
      event.stopPropagation()
      if (didDragRef.current) {
        didDragRef.current = false
        return
      }
      selectNode(node)
    },
    [selectNode],
  )

  const chooseMatch = useCallback(
    (node: MasteryTreeNode) => {
      setQuery('')
      selectNode(node)
      focusChampion(node)
    },
    [focusChampion, selectNode],
  )

  const edgesLayer = useMemo(() => {
    if (!layout) return null
    return layout.edges.map((edge) => (
      <path
        key={edge.id}
        d={edge.path}
        pathLength={1}
        className="tree-edge"
        fill="none"
        stroke={edge.color}
        strokeWidth={edge.width}
        strokeLinecap="round"
        style={{ animationDelay: `${edge.delay}s` }}
      />
    ))
  }, [layout])

  const nodesLayer = useMemo(() => {
    return orderedNodes.map((node) => {
      const meta = championMeta[node.championId]
      const style = getLevelStyle(node.level)
      const isSelected = node.id === selectedId
      const isHovered = node.id === hoveredId
      const isMatch = matchIds.has(node.id)
      const isDimmed =
        searchActive &&
        !isMatch &&
        !isSelected &&
        !isHovered
      const badgeRadius = clamp(node.radius * 0.27, 7, 13)
      const badgeOffset = node.radius * 0.74
      const showBadge = node.layer <= 2 || node.level >= 5
      const showLabel = node.rank < 10 || node.layer <= 1
      const showPoints = node.rank < 3
      const labelSize = node.layer === 0 ? 19 : node.layer === 1 ? 16 : 14
      const auraWidth = node.tier === 'legend' ? 3 : node.tier === 'core' ? 2 : 1.4

      return (
        <g
          key={node.id}
          transform={`translate(${node.x} ${node.y})`}
          className={[
            'mastery-node',
            isDimmed ? 'is-dimmed' : '',
            isMatch ? 'is-match' : '',
          ].join(' ')}
          data-node
          role="button"
          tabIndex={0}
          aria-label={`${node.name}. ${tm('sortLevel')} ${node.level}. ${numberFormatter.format(node.points)} ${tm('points')}.`}
          onClick={(event) => handleNodeClick(node, event)}
          onPointerEnter={(event) => handleNodeEnter(node, event)}
          onPointerLeave={handleNodeLeave}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              selectNode(node)
            }
          }}
        >
          <g
            className="tree-node-enter"
            style={{ animationDelay: `${node.delay}s` }}
          >
            <g
              className={[
                'tree-node-hover',
                isSelected ? 'is-selected' : '',
              ].join(' ')}
            >
              <circle r={node.radius + 6} fill="transparent" />

              {node.tier === 'legend' && (
                <>
                  <circle
                    r={node.radius + 11}
                    fill="none"
                    stroke="url(#tree-gold-ring)"
                    strokeWidth={2}
                    strokeDasharray="10 14"
                    className="tree-aura"
                  />
                  <circle
                    r={node.radius + 19}
                    fill="none"
                    stroke="rgba(240, 199, 94, 0.12)"
                    strokeWidth={1}
                  />
                </>
              )}

              {(node.tier === 'core' || node.tier === 'branch') && (
                <circle
                  r={node.radius + 5}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={auraWidth}
                  opacity={node.tier === 'core' ? 0.42 : 0.2}
                />
              )}

              <circle
                r={node.radius + 2}
                fill={style.soft}
                className={node.level >= 7 ? 'tree-node-glow' : undefined}
              />
              <circle
                r={node.radius}
                fill="#090512"
                stroke={style.color}
                strokeWidth={node.tier === 'legend' ? 3 : 2}
                opacity={0.98}
              />

              {meta ? (
                <>
                  <clipPath id={`champion-clip-${node.id}`}>
                    <circle r={Math.max(1, node.radius - 2)} />
                  </clipPath>
                  <image
                    href={championIconUrl(meta.key)}
                    x={-node.radius + 2}
                    y={-node.radius + 2}
                    width={(node.radius - 2) * 2}
                    height={(node.radius - 2) * 2}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#champion-clip-${node.id})`}
                  />
                </>
              ) : (
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={node.radius * 0.72}
                  fontWeight={800}
                  fill={style.color}
                >
                  {node.name.charAt(0)}
                </text>
              )}

              <circle
                r={Math.max(1, node.radius - 2)}
                fill="url(#tree-node-shade)"
                pointerEvents="none"
              />
              <circle
                r={node.radius}
                fill="none"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth={1}
                pointerEvents="none"
              />

              {isSelected && (
                <circle
                  r={node.radius + 9}
                  fill="none"
                  stroke="#f0c75e"
                  strokeWidth={2}
                  strokeDasharray="4 8"
                  className="tree-pulse"
                />
              )}

              {isMatch && !isSelected && (
                <circle
                  r={node.radius + 7}
                  fill="none"
                  stroke="#f0c75e"
                  strokeWidth={1.5}
                  opacity={0.9}
                  className="tree-pulse"
                />
              )}

              {showBadge && (
                <g transform={`translate(${badgeOffset} ${badgeOffset})`}>
                  <circle
                    r={badgeRadius}
                    fill="#08040f"
                    stroke={style.color}
                    strokeWidth={1.6}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={badgeRadius * 1.08}
                    fontWeight={800}
                    fill={style.color}
                  >
                    {node.level}
                  </text>
                </g>
              )}

              {showLabel && (
                <g pointerEvents="none">
                  <text
                    y={node.radius + (node.tier === 'legend' ? 22 : 19)}
                    textAnchor="middle"
                    fontSize={labelSize}
                    fontWeight={700}
                    fill={node.tier === 'legend' ? '#f7e2a4' : '#f5f3ff'}
                    stroke="#08040f"
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    style={{ paintOrder: 'stroke' }}
                  >
                    {node.name}
                  </text>
                  {showPoints && (
                    <text
                      y={node.radius + (node.tier === 'legend' ? 39 : 35)}
                      textAnchor="middle"
                      fontSize={labelSize * 0.66}
                      fontWeight={600}
                      fill={style.color}
                      stroke="#08040f"
                      strokeWidth={2.6}
                      strokeLinejoin="round"
                      style={{ paintOrder: 'stroke' }}
                    >
                      {compactFormatter.format(node.points)}
                    </text>
                  )}
                </g>
              )}
            </g>
          </g>
        </g>
      )
    })
  }, [
    orderedNodes,
    championMeta,
    selectedId,
    hoveredId,
    matchIds,
    searchActive,
    tm,
    numberFormatter,
    compactFormatter,
    handleNodeClick,
    handleNodeEnter,
    handleNodeLeave,
    selectNode,
  ])

  const extent = layout?.extent ?? 200

  if (loading) {
    return (
      <section className="relative flex h-[76vh] min-h-[520px] max-h-[920px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#05030d]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(124,58,237,0.18),transparent_52%)]" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="tree-loader relative h-28 w-28">
            <span />
            <span />
            <span />
            <span className="tree-loader-core" />
          </div>
          <p className="text-sm tracking-wide text-white/45">
            {tm('loadingMasteries')}
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="relative flex h-[60vh] min-h-[420px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-red-400/15 bg-[#05030d] px-6">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-white">{t('loadError')}</p>
          <p className="mt-2 text-sm text-white/40">{error}</p>
          <button
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className="mt-6 rounded-full border border-[#c89b3c]/40 bg-[#c89b3c]/10 px-5 py-2.5 text-sm font-semibold text-[#f0c75e] transition hover:bg-[#c89b3c]/20"
          >
            {t('retry')}
          </button>
        </div>
      </section>
    )
  }

  if (!layout || !layout.nodes.length) {
    return (
      <section className="relative flex h-[60vh] min-h-[420px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#05030d] px-6">
        <p className="text-lg text-white/45">{tm('noMasteries')}</p>
      </section>
    )
  }

  return (
    <section
      ref={containerRef}
      className="relative isolate h-[76vh] min-h-[540px] max-h-[960px] w-full overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#05030d] shadow-[0_40px_140px_-50px_rgba(124,58,237,0.55)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(124,58,237,0.20),transparent_54%),radial-gradient(circle_at_12%_88%,rgba(34,211,238,0.08),transparent_42%),radial-gradient(circle_at_88%_12%,rgba(200,155,60,0.07),transparent_38%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '34px 34px',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 to-transparent" />

      <svg
        ref={svgRef}
        viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`}
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 h-full w-full select-none"
        style={{
          touchAction: 'none',
          cursor: interacting ? 'grabbing' : 'grab',
        }}
        onPointerDown={handlePointerDown}
        onClick={(event) => {
          if (didDragRef.current) {
            didDragRef.current = false
            return
          }
          const target = event.target as Element
          if (!target.closest('[data-node]')) setSelectedId(null)
        }}
      >
        <defs>
          <radialGradient id="tree-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.24" />
            <stop offset="45%" stopColor="#4c1d95" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#05030d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tree-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0c75e" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#c89b3c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="tree-node-shade" cx="50%" cy="36%" r="70%">
            <stop offset="52%" stopColor="#05030d" stopOpacity="0" />
            <stop offset="100%" stopColor="#05030d" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        <circle
          r={extent * 0.92}
          fill="url(#tree-core-glow)"
          pointerEvents="none"
        />

        <g
          transform={`translate(${view.x} ${view.y}) scale(${view.k})`}
          className="tree-viewport"
        >
          <g pointerEvents="none" className="tree-rings">
            <circle
              r={layout.coreRadius}
              fill="none"
              stroke="rgba(192, 132, 252, 0.08)"
              strokeWidth={1}
              strokeDasharray="2 16"
              className="tree-aura"
            />
            <circle
              r={layout.coreRadius * 1.9}
              fill="none"
              stroke="rgba(56, 189, 248, 0.045)"
              strokeWidth={1}
              strokeDasharray="2 22"
            />
          </g>

          <g pointerEvents="none" className="tree-edges">
            {edgesLayer}
          </g>

          <g>{nodesLayer}</g>
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-none flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur-xl">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {tm('totalPoints')}
            </span>
            <span
              className="font-mono text-xs font-bold text-[#f0c75e]"
              title={numberFormatter.format(totalPoints)}
            >
              {compactFormatter.format(totalPoints)}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur-xl">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {tm('championsPlayed')}
            </span>
            <span className="font-mono text-xs font-bold text-cyan-300">
              {nodes.length}
            </span>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur-xl sm:flex">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {tm('mastery7Plus')}
            </span>
            <span className="font-mono text-xs font-bold text-violet-300">
              {masterySevenCount}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto relative w-full sm:w-[300px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setQuery('')
                  event.currentTarget.blur()
                }
                if (event.key === 'Enter' && matches[0]) {
                  chooseMatch(matches[0])
                }
              }}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              className="h-10 w-full rounded-full border border-white/10 bg-black/40 pl-10 pr-10 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-xl transition focus:border-[#c89b3c]/45 focus:ring-1 focus:ring-[#c89b3c]/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('close')}
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {searchActive && (
            <div className="absolute inset-x-0 top-full mt-2 max-h-[280px] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0616]/95 p-1.5 shadow-2xl backdrop-blur-2xl">
              {matches.length > 0 ? (
                <>
                  <p className="px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                    {t('searchMatches', { count: matches.length })}
                  </p>
                  {matches.slice(0, 8).map((node) => {
                    const meta = championMeta[node.championId]
                    const style = getLevelStyle(node.level)
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => chooseMatch(node)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/[0.06]"
                      >
                        <span
                          className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border"
                          style={{ borderColor: `${style.color}66` }}
                        >
                          {meta ? (
                            <Image
                              src={championIconUrl(meta.key)}
                              alt=""
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/60">
                              {node.name.charAt(0)}
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-white/85">
                            {node.name}
                          </span>
                          <span className="block text-[10px] text-white/35">
                            {numberFormatter.format(node.points)} {tm('points')} · M{node.level}
                          </span>
                        </span>
                        <span
                          className="font-mono text-[10px] font-bold"
                          style={{ color: style.color }}
                        >
                          #{node.rank + 1}
                        </span>
                      </button>
                    )
                  })}
                </>
              ) : (
                <p className="px-3 py-4 text-center text-xs text-white/35">
                  {t('noResults')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {!selectedNode && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden rounded-2xl border border-white/[0.07] bg-black/30 px-3.5 py-2.5 backdrop-blur-xl sm:block">
          <p className="text-[10px] font-medium text-white/45">{t('legend')}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[9px] text-white/35">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
              M5
            </span>
            <span className="flex items-center gap-1 text-[9px] text-white/35">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c084fc]" />
              M6
            </span>
            <span className="flex items-center gap-1 text-[9px] text-white/35">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f0c75e]" />
              M7
            </span>
            <span className="text-[8px] uppercase tracking-[0.16em] text-white/20">
              {t('legendLevels')}
            </span>
          </div>
        </div>
      )}

      {!selectedNode && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/[0.06] bg-black/30 px-4 py-2 text-[10px] text-white/35 backdrop-blur-xl md:flex">
          <Move className="h-3 w-3" />
          {t('clickHint')}
        </div>
      )}

      <div
        className={[
          'absolute bottom-4 right-4 z-30 flex flex-col gap-2',
          selectedNode ? 'max-sm:hidden' : '',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => zoomAtCenter(1.35)}
          aria-label={t('zoomIn')}
          title={t('zoomIn')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/65 backdrop-blur-xl transition hover:border-[#c89b3c]/40 hover:text-[#f0c75e] active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => zoomAtCenter(1 / 1.35)}
          aria-label={t('zoomOut')}
          title={t('zoomOut')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/65 backdrop-blur-xl transition hover:border-[#c89b3c]/40 hover:text-[#f0c75e] active:scale-95"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={resetView}
          aria-label={t('resetView')}
          title={t('resetView')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/65 backdrop-blur-xl transition hover:border-[#c89b3c]/40 hover:text-[#f0c75e] active:scale-95"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {tooltip && hoveredNode && !selectedNode && !interacting && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full"
            style={{ left: tooltip.x, top: tooltip.y - 12 }}
          >
            <div className="min-w-[160px] rounded-xl border border-white/10 bg-[#08040f]/95 px-3 py-2 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-bold text-white">{hoveredNode.name}</p>
              {hoveredNode.title && (
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/30">
                  {hoveredNode.title}
                </p>
              )}
              <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                <span
                  className="font-bold"
                  style={{ color: getLevelStyle(hoveredNode.level).color }}
                >
                  M{hoveredNode.level}
                </span>
                <span className="text-white/45">
                  {numberFormatter.format(hoveredNode.points)} {tm('points')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:left-3 sm:w-[360px]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0616]/92 p-3.5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${getLevelStyle(selectedNode.level).color}, transparent)`,
                }}
              />

              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div
                    className="h-16 w-16 overflow-hidden rounded-full border-2"
                    style={{
                      borderColor: getLevelStyle(selectedNode.level).color,
                      boxShadow: `0 0 24px ${getLevelStyle(selectedNode.level).soft}`,
                    }}
                  >
                    {championMeta[selectedNode.championId] ? (
                      <Image
                        src={championIconUrl(
                          championMeta[selectedNode.championId].key,
                        )}
                        alt={selectedNode.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xl font-black text-white/60">
                        {selectedNode.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 bg-[#08040f] px-1 text-[10px] font-black"
                    style={{
                      borderColor: getLevelStyle(selectedNode.level).color,
                      color: getLevelStyle(selectedNode.level).color,
                    }}
                  >
                    {selectedNode.level}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                    {t('rankOf', {
                      rank: selectedNode.rank + 1,
                      total: nodes.length,
                    })}
                  </p>
                  <h3 className="truncate text-lg font-bold leading-tight text-white">
                    {selectedNode.name}
                  </h3>
                  {selectedNode.title && (
                    <p className="truncate text-[10px] uppercase tracking-[0.14em] text-white/35">
                      {selectedNode.title}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span
                      className="font-mono text-xl font-black"
                      style={{
                        color: getLevelStyle(selectedNode.level).color,
                      }}
                    >
                      {numberFormatter.format(selectedNode.points)}
                    </span>
                    <span className="text-[10px] text-white/35">
                      {tm('points')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label={t('close')}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/35">
                    {tm('sortLevel')} {selectedNode.level}
                  </span>
                  <span className="text-white/45">
                    {t('shareOfTotal', {
                      percent: percentageFormatter.format(selectedNode.share),
                    })}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${clamp(selectedNode.share, 2, 100)}%`,
                      background: `linear-gradient(90deg, ${getLevelStyle(selectedNode.level).color}, #7c3aed)`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => focusChampion(selectedNode)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-[11px] font-semibold text-white/65 transition hover:border-[#c89b3c]/35 hover:bg-[#c89b3c]/10 hover:text-[#f0c75e]"
              >
                <Crosshair className="h-3.5 w-3.5" />
                {t('centerChampion')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
