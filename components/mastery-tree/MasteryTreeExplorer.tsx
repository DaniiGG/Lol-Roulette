'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useLocale, useTranslations } from 'next-intl'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Crosshair,
  Expand,
  GitBranch,
  Hand,
  Info,
  Keyboard,
  Layers,
  Loader2,
  Maximize2,
  MousePointer2,
  Move,
  Plus,
  RefreshCw,
  RotateCcw,
  Ruler,
  Search,
  Share2,
  Sparkles,
  UserRound,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import TreeScene from './TreeScene'
import ChampionDetailsModal from './ChampionDetailsModal'
import PersonalizeModal from './PersonalizeModal'
import ShareModal from './ShareModal'
import { DDRAGON_VERSION, loadChampionData } from '@/lib/champion-data'
import { buildChampionCatalog } from '@/lib/mastery-tree/catalog'
import { buildExplorerLayout } from '@/lib/mastery-tree/explorer-layout'
import {
  EMPTY_LAYOUT,
  EXPLORER_ROLES,
  type ChampionCatalogEntry,
  type ExplorerMode,
  type ExplorerNode,
  type ExplorerRole,
  type MasteryMap,
} from '@/lib/mastery-tree/explorer-types'
import {
  MAX_MASTERY_POINTS,
  SHARE_QUERY_KEY,
  decodeShareState,
  encodeShareState,
} from '@/lib/mastery-tree/share-state'
import { parseMasteryImport } from '@/lib/mastery-tree/import'
import { ROLE_COLORS, clamp } from '@/lib/mastery-tree/visuals'
import { championIconUrl } from '@/lib/champion-data'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events'

const STORAGE_KEY = 'leagueroulette:mastery-tree:v1'
const MAX_STORED_ENTRIES = 500
const MIN_SCALE = 0.48
const MAX_SCALE = 4
const FOCUS_SCALE = 1.8

interface ViewState {
  scale: number
  x: number
  y: number
}

interface TooltipState {
  championId: number
  x: number
  y: number
}

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function readStoredMasteries(): MasteryMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const next: MasteryMap = {}
    let count = 0

    for (const [rawId, rawValue] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (count >= MAX_STORED_ENTRIES) break
      const championId = Number(rawId)
      if (!Number.isInteger(championId) || championId <= 0) continue
      if (!rawValue || typeof rawValue !== 'object') continue

      const value = rawValue as Record<string, unknown>
      const points =
        typeof value.points === 'number' &&
        Number.isFinite(value.points) &&
        value.points >= 0 &&
        value.points <= MAX_MASTERY_POINTS
          ? Math.round(value.points)
          : null
      const level =
        typeof value.level === 'number' &&
        Number.isFinite(value.level) &&
        value.level >= 0 &&
        value.level <= 10
          ? Math.round(value.level)
          : null

      next[championId] = { points, level }
      count += 1
    }

    return next
  } catch {
    return {}
  }
}

function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const matrix = svg.getScreenCTM()
  if (!matrix) return { x: 0, y: 0 }
  return new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse())
}

interface MasteryTreeExplorerProps {
  readOnlyMastery?: boolean
}

export default function MasteryTreeExplorer({
  readOnlyMastery = false,
}: MasteryTreeExplorerProps) {
  const locale = useLocale()
  const t = useTranslations('masteryTreeExplorer')
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const [catalog, setCatalog] = useState<ChampionCatalogEntry[] | null>(null)
  const [catalogLocale, setCatalogLocale] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [masteries, setMasteries] = useState<MasteryMap>({})
  const [hydrated, setHydrated] = useState(false)
  const autoLoadRef = useRef(false)
  const [mode, setMode] = useState<ExplorerMode>('explore')
  const [sizeByMastery, setSizeByMastery] = useState(true)
  const [showBranches, setShowBranches] = useState(true)
  const [roleFilter, setRoleFilter] = useState<ExplorerRole | 'all'>('all')
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchIndex, setSearchIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [personalizeOpen, setPersonalizeOpen] = useState(false)
  const [personalizeTarget, setPersonalizeTarget] = useState<number | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [sharedNotice, setSharedNotice] = useState<number | null>(null)
  const [directoryOpen, setDirectoryOpen] = useState(false)
  const [directoryQuery, setDirectoryQuery] = useState('')

  const canvasSectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const persistRef = useRef(true)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const dragRef = useRef<{
    pointerId: number
    start: { x: number; y: number }
    startView: ViewState
  } | null>(null)
  const pinchRef = useRef<{
    distance: number
    startScale: number
    world: { x: number; y: number }
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    loadChampionData(locale)
      .then((meta) => {
        if (cancelled) return
        setCatalog(buildChampionCatalog(meta))
        setCatalogLocale(locale)
        setLoadError(false)
      })
      .catch(() => {
        if (cancelled) return
        setCatalogLocale(locale)
        setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [locale, reloadKey])

  const loading = catalogLocale !== locale || (catalog === null && !loadError)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get(SHARE_QUERY_KEY)

    if (raw) {
      const decoded = decodeShareState(raw)
      if (decoded.ok) {
        setMasteries(decoded.masteries)
        setMode('personal')
        setView({ scale: 1, x: 0, y: 0 })
        setSharedNotice(decoded.count)
        persistRef.current = false
        setHydrated(true)
        return
      }
    }

    const stored = readStoredMasteries()
    if (Object.keys(stored).length > 0) {
      setMasteries(stored)
      setMode('personal')
      persistRef.current = true
    }
    setHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated || !persistRef.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(masteries))
    } catch {
      // Storage can be unavailable in private or restricted contexts.
    }
  }, [masteries, hydrated])

  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.treeOpened, { locale })
  }, [locale])

  useEffect(() => {
    if (!query.trim()) return
    const timer = window.setTimeout(() => {
      trackEvent(ANALYTICS_EVENTS.searchUsed)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [query])

  const roleLabels = useMemo<Record<ExplorerRole, string>>(
    () => ({
      top: t('roles.top'),
      jungle: t('roles.jungle'),
      mid: t('roles.mid'),
      adc: t('roles.adc'),
      support: t('roles.support'),
    }),
    [t],
  )

  const layout = useMemo(() => {
    if (!catalog) return EMPTY_LAYOUT
    return buildExplorerLayout(catalog, {
      mode,
      masteries,
      sizeByMastery,
    })
  }, [catalog, mode, masteries, sizeByMastery])

  const selectedChampion = useMemo(
    () => catalog?.find((champion) => champion.championId === selectedId) ?? null,
    [catalog, selectedId],
  )

  const hoveredChampion = useMemo(
    () => catalog?.find((champion) => champion.championId === hoveredId) ?? null,
    [catalog, hoveredId],
  )

  const hoveredNode = useMemo(
    () => layout.nodes.find((node) => node.championId === hoveredId) ?? null,
    [layout.nodes, hoveredId],
  )

  const selectedRank = useMemo(() => {
    if (selectedId === null) return null
    if (layout.centerNodeId === selectedId) return 1
    return (
      layout.nodes.find((node) => node.championId === selectedId)?.rank ?? null
    )
  }, [layout, selectedId])

  const normalizedQuery = normalizeSearch(query.trim())

  const allMatches = useMemo(() => {
    if (!normalizedQuery || !catalog) return []
    return catalog.filter((champion) => {
      if (roleFilter !== 'all' && !champion.roles.includes(roleFilter)) {
        return false
      }
      return [champion.name, champion.title, champion.key].some((value) =>
        normalizeSearch(value).includes(normalizedQuery),
      )
    })
  }, [catalog, normalizedQuery, roleFilter])

  const matchIds = useMemo(
    () => new Set(allMatches.map((champion) => champion.championId)),
    [allMatches],
  )

  const searchResults = useMemo(() => allMatches.slice(0, 8), [allMatches])
  const searchActive = normalizedQuery.length > 0
  const searchOpen =
    searchFocused && searchActive && searchResults.length > 0
  const activeSearchIndex =
    searchResults.length > 0
      ? Math.min(Math.max(searchIndex, 0), searchResults.length - 1)
      : -1

  const visibleNodeCount = useMemo(() => {
    return layout.nodes.filter(
      (node) =>
        node.isCenter ||
        roleFilter === 'all' ||
        node.primaryRole === roleFilter,
    ).length
  }, [layout.nodes, roleFilter])

  const directoryChampions = useMemo(() => {
    if (!catalog) return []
    const normalized = normalizeSearch(directoryQuery.trim())
    return catalog
      .filter((champion) => {
        if (mode === 'personal' && !masteries[champion.championId]) return false
        if (roleFilter !== 'all' && !champion.roles.includes(roleFilter)) {
          return false
        }
        if (!normalized) return true
        return [champion.name, champion.title, champion.key].some((value) =>
          normalizeSearch(value).includes(normalized),
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name, locale))
  }, [catalog, mode, masteries, roleFilter, directoryQuery, locale])

  const clearSharedUrl = useCallback(() => {
    if (typeof window === 'undefined') return
    const current = new URL(window.location.href)
    if (!current.searchParams.has(SHARE_QUERY_KEY)) return
    current.searchParams.delete(SHARE_QUERY_KEY)
    window.history.replaceState(
      {},
      '',
      `${current.pathname}${current.search}${current.hash}`,
    )
  }, [])

  const updateMasteries = useCallback(
    (next: MasteryMap) => {
      persistRef.current = true
      setMasteries(next)
      clearSharedUrl()
      if (sharedNotice !== null) setSharedNotice(null)
      if (mode === 'explore' && Object.keys(next).length > 0) {
        setMode('personal')
        setView({ scale: 1, x: 0, y: 0 })
      }
    },
    [mode, sharedNotice, clearSharedUrl],
  )

  /* Best-effort: automatically load the logged-in user's champion mastery
     so the tree shows their data without any manual import step. */
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (cancelled || autoLoadRef.current || !hydrated) return
      // Respect explicit data: share URL or localStorage take precedence.
      if (Object.keys(masteries).length > 0) return

      const token = Cookies.get('session_token')
      if (!token) return

      autoLoadRef.current = true

      try {
        const verifyResponse = await fetch('/api/auth/verify-session', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!verifyResponse.ok) return
        const verifyPayload = await verifyResponse.json()
        const user = verifyPayload?.user
        if (!user?.puuid || !user?.region) return

        const masteryResponse = await fetch('/api/champion-mastery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ puuid: user.puuid, region: user.region }),
        })
        if (!masteryResponse.ok || cancelled) return
        const masteryPayload = await masteryResponse.json()
        const result = parseMasteryImport(
          JSON.stringify(masteryPayload?.masteries ?? []),
        )
        if (!result.ok || cancelled) return

        const next: MasteryMap = {}
        for (const entry of result.entries) {
          next[entry.championId] = {
            points: entry.points,
            level: entry.level,
          }
        }

        if (cancelled) return
        updateMasteries(next)
      } catch {
        // Auto-load is best-effort; fall back to the empty / explore tree.
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [hydrated, masteries, updateMasteries])

  const openPersonalize = useCallback(
    (championId: number | null = null) => {
      setPersonalizeTarget(championId)
      setDetailsOpen(false)
      setPersonalizeOpen(true)
    },
    [],
  )

  const scrollToCanvas = () => {
    canvasSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleExplore = () => {
    setMode('explore')
    setView({ scale: 1, x: 0, y: 0 })
    scrollToCanvas()
  }

  const handleSelectChampion = useCallback(
    (champion: ChampionCatalogEntry, source: 'tree' | 'search' | 'directory') => {
      setSelectedId(champion.championId)
      setDetailsOpen(true)
      setHoveredId(null)
      setTooltip(null)
      trackEvent(ANALYTICS_EVENTS.championSelected, {
        role: champion.primaryRole,
        source,
      })
    },
    [],
  )

  const handleNodeClick = useCallback(
    (node: ExplorerNode) => {
      const champion = catalog?.find(
        (entry) => entry.championId === node.championId,
      )
      if (champion) handleSelectChampion(champion, 'tree')
    },
    [catalog, handleSelectChampion],
  )

  const handleNodeEnter = useCallback(
    (node: ExplorerNode, event: ReactPointerEvent<SVGGElement>) => {
      setHoveredId(node.championId)
      const container = canvasRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      setTooltip({
        championId: node.championId,
        x: clamp(event.clientX - rect.left, 12, Math.max(12, rect.width - 236)),
        y: clamp(event.clientY - rect.top, 12, Math.max(12, rect.height - 176)),
      })
    },
    [],
  )

  const handleNodeLeave = useCallback(() => {
    setHoveredId(null)
    setTooltip(null)
  }, [])

  const pickSearchResult = useCallback(
    (champion: ChampionCatalogEntry) => {
      handleSelectChampion(champion, 'search')
      setQuery('')
      setSearchFocused(false)
    },
    [handleSelectChampion],
  )

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'ArrowDown' && searchResults.length > 0) {
      event.preventDefault()
      setSearchIndex((activeSearchIndex + 1) % searchResults.length)
    } else if (event.key === 'ArrowUp' && searchResults.length > 0) {
      event.preventDefault()
      setSearchIndex(
        (activeSearchIndex - 1 + searchResults.length) % searchResults.length,
      )
    } else if (event.key === 'Enter' && searchResults.length > 0) {
      event.preventDefault()
      pickSearchResult(searchResults[activeSearchIndex] ?? searchResults[0])
    } else if (event.key === 'Escape') {
      setQuery('')
      setSearchFocused(false)
    }
  }

  const handleRoleFilter = (role: ExplorerRole | 'all') => {
    setRoleFilter(role)
    setSearchIndex(0)
    trackEvent(ANALYTICS_EVENTS.filterChanged, { role })
  }

  const handleMode = (next: ExplorerMode) => {
    setMode(next)
    setView({ scale: 1, x: 0, y: 0 })
    trackEvent(ANALYTICS_EVENTS.filterChanged, { mode: next })
  }

  const zoomBy = (factor: number) => {
    setView((current) => {
      const nextScale = clamp(current.scale * factor, MIN_SCALE, MAX_SCALE)
      const ratio = nextScale / current.scale
      return {
        scale: nextScale,
        x: current.x * ratio,
        y: current.y * ratio,
      }
    })
  }

  const resetView = () => setView({ scale: 1, x: 0, y: 0 })

  const focusChampion = useCallback(
    (champion: ChampionCatalogEntry) => {
      const node = layout.nodes.find(
        (entry) => entry.championId === champion.championId,
      )
      if (!node) {
        openPersonalize(champion.championId)
        return
      }

      setRoleFilter('all')
      setSelectedId(champion.championId)
      setDetailsOpen(false)
      setView({
        scale: FOCUS_SCALE,
        x: -node.x * FOCUS_SCALE,
        y: -node.y * FOCUS_SCALE,
      })
    },
    [layout.nodes, openPersonalize],
  )

  const removeMastery = useCallback(
    (champion: ChampionCatalogEntry) => {
      const next = { ...masteries }
      delete next[champion.championId]
      persistRef.current = true
      setMasteries(next)
    },
    [masteries],
  )

  const openShare = () => {
    const base =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : `https://leagueroulette.com${locale === 'es' ? '/es' : ''}/mastery-tree`
    const encoded =
      mode === 'personal' && Object.keys(masteries).length > 0
        ? encodeShareState(masteries)
        : ''
    setShareUrl(encoded ? `${base}?${SHARE_QUERY_KEY}=${encoded}` : base)
    setShareOpen(true)
    trackEvent(ANALYTICS_EVENTS.shareClicked, { method: 'open' })
  }

  const startOwnTree = () => {
    persistRef.current = true
    setMasteries({})
    setMode('personal')
    setSharedNotice(null)
    setView({ scale: 1, x: 0, y: 0 })
    clearSharedUrl()
    openPersonalize(null)
  }

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleWheel = (event: WheelEvent) => {
      if (!layout.nodes.length) return
      event.preventDefault()

      const point = svgPoint(svg, event.clientX, event.clientY)
      const factor = Math.exp(-event.deltaY * 0.0012)

      setView((current) => {
        const nextScale = clamp(current.scale * factor, MIN_SCALE, MAX_SCALE)
        const worldX = (point.x - current.x) / current.scale
        const worldY = (point.y - current.y) / current.scale
        return {
          scale: nextScale,
          x: point.x - worldX * nextScale,
          y: point.y - worldY * nextScale,
        }
      })
    }

    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [layout.nodes.length])

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const target = event.target as Element
    if (target.closest('.mt-node')) return

    const svg = svgRef.current
    if (!svg) return

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    svg.setPointerCapture(event.pointerId)
    setTooltip(null)
    setHoveredId(null)

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        pointerId: event.pointerId,
        start: svgPoint(svg, event.clientX, event.clientY),
        startView: view,
      }
      pinchRef.current = null
    } else if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values())
      const midClient = {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2,
      }
      const mid = svgPoint(svg, midClient.x, midClient.y)
      pinchRef.current = {
        distance: Math.hypot(first.x - second.x, first.y - second.y) || 1,
        startScale: view.scale,
        world: {
          x: (mid.x - view.x) / view.scale,
          y: (mid.y - view.y) / view.scale,
        },
      }
      dragRef.current = null
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    const svg = svgRef.current
    if (!svg) return

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = Array.from(pointersRef.current.values())
      const midClient = {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2,
      }
      const mid = svgPoint(svg, midClient.x, midClient.y)
      const distance =
        Math.hypot(first.x - second.x, first.y - second.y) || 1
      const nextScale = clamp(
        pinchRef.current.startScale * (distance / pinchRef.current.distance),
        MIN_SCALE,
        MAX_SCALE,
      )
      setView({
        scale: nextScale,
        x: mid.x - pinchRef.current.world.x * nextScale,
        y: mid.y - pinchRef.current.world.y * nextScale,
      })
      return
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const current = svgPoint(svg, event.clientX, event.clientY)
    setView({
      scale: drag.startView.scale,
      x: drag.startView.x + (current.x - drag.start.x),
      y: drag.startView.y + (current.y - drag.start.y),
    })
  }

  const handlePointerEnd = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(event.pointerId)
    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId)
    }
    if (pointersRef.current.size < 2) pinchRef.current = null
    if (pointersRef.current.size === 0) dragRef.current = null
  }

  const handleCanvasKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (event.target !== event.currentTarget) return
    const step = 70
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomBy(1.15)
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      zoomBy(1 / 1.15)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setView((current) => ({ ...current, x: current.x + step }))
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      setView((current) => ({ ...current, x: current.x - step }))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setView((current) => ({ ...current, y: current.y + step }))
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setView((current) => ({ ...current, y: current.y - step }))
    } else if (event.key === '0') {
      event.preventDefault()
      resetView()
    }
  }

  const viewBox = `${-layout.extent} ${-layout.extent} ${
    layout.extent * 2
  } ${layout.extent * 2}`

  const isEmptyPersonal = mode === 'personal' && layout.nodes.length === 0
  const isEmptyFilter =
    !isEmptyPersonal && layout.nodes.length > 0 && visibleNodeCount === 0

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05030d] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[780px] bg-[radial-gradient(ellipse_at_50%_-10%,rgba(124,58,237,0.2),transparent_58%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[540px] w-[980px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.1),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        {sharedNotice !== null && (
          <div
            role="status"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#c89b3c]/25 bg-[#c89b3c]/[0.06] px-4 py-3.5 sm:flex-row sm:items-center"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f0c75e]/30 bg-[#f0c75e]/10 text-[#f0c75e]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#f0c75e]">{t('shareLoaded')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                {t('shareLoadedBody')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={startOwnTree}
                className="rounded-lg border border-[#c89b3c]/35 bg-[#c89b3c]/10 px-3 py-1.5 text-[10px] font-semibold text-[#f0c75e] transition hover:bg-[#c89b3c]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
              >
                {t('shareLoadedCta')}
              </button>
              <button
                type="button"
                onClick={() => setSharedNotice(null)}
                aria-label={t('shareLoadedDismiss')}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <section className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c89b3c]/25 bg-[#c89b3c]/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f0c75e]/85">
            <Sparkles className="h-3 w-3" />
            {t('badge')}
          </span>
          <h1
            className="mt-5 text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.92] text-[#fff8e6]"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.01em' }}
          >
            {t('h1')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/45 sm:text-base">
            {t('heroText')}
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => openPersonalize(null)}
              disabled={!catalog}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#c89b3c]/50 bg-[#c89b3c] px-5 py-3 text-sm font-bold text-[#120c04] shadow-[0_12px_40px_-14px_rgba(240,199,94,0.65)] transition hover:bg-[#e1b84e] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/60 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {t('ctaPersonalize')}
            </button>
            <button
              type="button"
              onClick={handleExplore}
              disabled={!catalog}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50 sm:w-auto"
            >
              {t('ctaExplore')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
            {catalog && <span>{t('heroStatChampions', { count: catalog.length })}</span>}
            <span>{t('heroStatNoAccount')}</span>
            <span>{t('heroStatExport')}</span>
          </div>
        </section>

        <section ref={canvasSectionRef} className="mt-10 scroll-mt-24" aria-labelledby="mt-tree-title">
          <h2 id="mt-tree-title" className="sr-only">
            {t('treeRegionLabel')}
          </h2>

          <div className="rounded-[1.75rem] border border-white/[0.07] bg-[#080512]/80 p-2 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.9)] sm:p-3">
            <div className="flex flex-col gap-3 border-b border-white/[0.06] px-2 pb-3 sm:px-3">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="group"
                  aria-label={t('modeLabel')}
                  className="inline-flex rounded-xl border border-white/10 bg-black/25 p-0.5"
                >
                  <button
                    type="button"
                    onClick={() => handleMode('personal')}
                    aria-pressed={mode === 'personal'}
                    className={[
                      'rounded-[10px] px-3 py-1.5 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
                      mode === 'personal'
                        ? 'bg-[#c89b3c]/20 text-[#f0c75e]'
                        : 'text-white/40 hover:text-white/70',
                    ].join(' ')}
                  >
                    {t('modePersonal')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMode('explore')}
                    aria-pressed={mode === 'explore'}
                    className={[
                      'rounded-[10px] px-3 py-1.5 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
                      mode === 'explore'
                        ? 'bg-[#f0c75e]/15 text-[#f0c75e]'
                        : 'text-white/40 hover:text-white/70',
                    ].join(' ')}
                  >
                    {t('modeExplore')}
                  </button>
                </div>

                <div className="relative min-w-[190px] flex-1 sm:max-w-xs">
                  <label className="block">
                    <span className="sr-only">{t('searchLabel')}</span>
                    <span className="relative block">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value)
                          setSearchIndex(0)
                          setSearchFocused(true)
                        }}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={t('searchPlaceholder')}
                        role="combobox"
                        aria-expanded={searchOpen}
                        aria-controls="mt-search-results"
                        aria-autocomplete="list"
                        className="h-9 w-full rounded-xl border border-white/10 bg-black/25 pl-9 pr-8 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-[#c89b3c]/45 focus:ring-1 focus:ring-[#c89b3c]/20"
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery('')
                            setSearchFocused(false)
                          }}
                          aria-label={t('searchLabel')}
                          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  </label>

                  {searchOpen && (
                    <div
                      id="mt-search-results"
                      role="listbox"
                      className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl border border-white/10 bg-[#0c0818] p-1.5 shadow-2xl"
                    >
                      {searchResults.map((champion, index) => (
                        <button
                          key={champion.championId}
                          type="button"
                          role="option"
                          aria-selected={index === activeSearchIndex}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => pickSearchResult(champion)}
                          onMouseEnter={() => setSearchIndex(index)}
                          className={[
                            'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition',
                            index === activeSearchIndex
                              ? 'bg-[#c89b3c]/15'
                              : 'hover:bg-white/[0.05]',
                          ].join(' ')}
                        >
                          <span
                            className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border"
                            style={{
                              borderColor: `${ROLE_COLORS[champion.primaryRole].color}66`,
                            }}
                          >
                            <Image
                              src={championIconUrl(champion.key)}
                              alt=""
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-white/85">
                              {champion.name}
                            </span>
                            <span className="block truncate text-[9px] uppercase tracking-[0.12em] text-white/30">
                              {t(`roles.${champion.primaryRole}`)}
                            </span>
                          </span>
                          {masteries[champion.championId] && (
                            <Check className="h-3.5 w-3.5 shrink-0 text-[#5ee0a0]" />
                          )}
                        </button>
                      ))}
                      <p className="px-2 pb-1 pt-2 text-[9px] text-white/25">
                        {t('searchHint')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPersonalize(null)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[10px] font-semibold text-white/60 transition hover:border-[#f0c75e]/35 hover:text-[#f0c75e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('personalize')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openShare}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#c89b3c]/35 bg-[#c89b3c]/10 px-3 text-[10px] font-semibold text-[#f0c75e] transition hover:bg-[#c89b3c]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('share')}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div
                  className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  role="group"
                  aria-label={t('roleFilterLabel')}
                >
                  <button
                    type="button"
                    onClick={() => handleRoleFilter('all')}
                    aria-pressed={roleFilter === 'all'}
                    className={[
                      'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
                      roleFilter === 'all'
                        ? 'border-[#c89b3c]/45 bg-[#c89b3c]/15 text-[#f0c75e]'
                        : 'border-white/[0.08] text-white/40 hover:text-white/70',
                    ].join(' ')}
                  >
                    {t('roleAll')}
                  </button>
                  {EXPLORER_ROLES.map((role) => {
                    const palette = ROLE_COLORS[role]
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleFilter(role)}
                        aria-pressed={roleFilter === role}
                        className={[
                          'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
                          roleFilter === role
                            ? 'text-white'
                            : 'border-white/[0.08] text-white/40 hover:text-white/70',
                        ].join(' ')}
                        style={
                          roleFilter === role
                            ? {
                                borderColor: `${palette.color}66`,
                                backgroundColor: palette.soft,
                              }
                            : undefined
                        }
                      >
                        {t(`roles.${role}`)}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowBranches((value) => !value)}
                    aria-pressed={showBranches}
                    title={showBranches ? t('toggleBranchesOn') : t('toggleBranchesOff')}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
                      showBranches
                        ? 'border-[#f0c75e]/25 bg-[#f0c75e]/[0.07] text-[#f0c75e]/80'
                        : 'border-white/[0.08] text-white/35 hover:text-white/60',
                    ].join(' ')}
                  >
                    <GitBranch className="h-3 w-3" />
                    {t('toggleBranches')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeByMastery((value) => !value)}
                    aria-pressed={sizeByMastery}
                    title={t('sizeByMasteryHint')}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
                      sizeByMastery
                        ? 'border-[#f0c75e]/25 bg-[#f0c75e]/[0.07] text-[#f0c75e]/80'
                        : 'border-white/[0.08] text-white/35 hover:text-white/60',
                    ].join(' ')}
                  >
                    <Ruler className="h-3 w-3" />
                    {sizeByMastery ? t('sizeByMastery') : t('sizeEven')}
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={canvasRef}
              className="relative mt-2 h-[480px] overflow-hidden rounded-[1.4rem] border border-white/[0.06] bg-[#05030d] sm:h-[620px] lg:h-[720px]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.08),transparent_66%)]" />

              <svg
                ref={svgRef}
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                role="group"
                aria-label={t('treeAriaLabel')}
                tabIndex={0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onKeyDown={handleCanvasKeyDown}
                className="mt-scene relative h-full w-full touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f0c75e]/35"
              >
                <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
                  <TreeScene
                    layout={layout}
                    mode={mode}
                    selectedId={selectedId}
                    hoveredId={hoveredId}
                    matchIds={matchIds}
                    searchActive={searchActive}
                    roleFilter={roleFilter}
                    showBranches={showBranches}
                    showNames={view.scale >= 1.12}
                    locale={locale}
                    roleLabels={roleLabels}
                    centerLabel={t('exploreCenterLabel')}
                    centerSub={t('exploreCenterSub')}
                    rootLabel={t('rootLabel')}
                    openDetailsLabel={t('openDetails')}
                    onNodeClick={handleNodeClick}
                    onNodeEnter={handleNodeEnter}
                    onNodeLeave={handleNodeLeave}
                  />
                </g>
              </svg>

              <div className="pointer-events-none absolute left-3 top-3 flex max-w-[calc(100%-110px)] flex-wrap gap-1.5 sm:left-4 sm:top-4">
                {mode === 'personal' ? (
                  <>
                    <span className="rounded-lg border border-white/[0.08] bg-black/45 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40 backdrop-blur">
                      {t('totalPoints')}{' '}
                      <span className="text-[#f0c75e]">
                        {numberFormatter.format(layout.totalPoints)}
                      </span>
                    </span>
                    <span className="rounded-lg border border-white/[0.08] bg-black/45 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40 backdrop-blur">
                      {t('championsInTree')}{' '}
                      <span className="text-white/75">{layout.nodes.length}</span>
                    </span>
                    <span className="hidden rounded-lg border border-white/[0.08] bg-black/45 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40 backdrop-blur sm:inline">
                      {t('masteryKnown')}{' '}
                      <span className="text-[#5ee0a0]">
                        {
                          layout.nodes.filter(
                            (node) => node.points !== null || node.level !== null,
                          ).length
                        }
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="rounded-lg border border-white/[0.08] bg-black/45 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40 backdrop-blur">
                    {t('championsInTree')}{' '}
                    <span className="text-white/75">{layout.nodes.length}</span>
                  </span>
                )}
              </div>

              <div className="absolute right-3 top-3 flex flex-col gap-1.5 sm:right-4 sm:top-4">
                <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/55 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => zoomBy(1.2)}
                    aria-label={t('zoomIn')}
                    title={t('zoomIn')}
                    className="flex h-8 w-8 items-center justify-center text-white/55 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f0c75e]/50"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <span className="mx-auto h-px w-5 bg-white/10" />
                  <button
                    type="button"
                    onClick={() => zoomBy(1 / 1.2)}
                    aria-label={t('zoomOut')}
                    title={t('zoomOut')}
                    className="flex h-8 w-8 items-center justify-center text-white/55 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f0c75e]/50"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={resetView}
                  aria-label={t('fitView')}
                  title={t('fitView')}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-white/55 backdrop-blur transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  aria-label={t('resetView')}
                  title={t('resetView')}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-white/55 backdrop-blur transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <span className="rounded-lg border border-white/10 bg-black/55 px-1.5 py-1 text-center text-[9px] font-semibold tabular-nums text-white/40 backdrop-blur">
                  {Math.round(view.scale * 100)}%
                </span>
              </div>

              {tooltip && hoveredNode && hoveredChampion && (
                <div
                  className="pointer-events-none absolute z-20 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0b0717]/95 shadow-2xl backdrop-blur"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  <div className="flex items-center gap-2.5 border-b border-white/[0.06] p-2.5">
                    <span
                      className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border"
                      style={{
                        borderColor: ROLE_COLORS[hoveredNode.primaryRole].color,
                      }}
                    >
                      <Image
                        src={championIconUrl(hoveredNode.key)}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">
                        {hoveredNode.name}
                      </p>
                      <p className="truncate text-[9px] text-white/35">
                        {hoveredChampion.title}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 p-2.5 text-[10px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/35">{t('tooltipRole')}</span>
                      <span
                        className="font-semibold"
                        style={{ color: ROLE_COLORS[hoveredNode.primaryRole].color }}
                      >
                        {roleLabels[hoveredNode.primaryRole]}
                      </span>
                    </div>
                    {hoveredNode.roles.length > 1 && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/35">{t('tooltipSecondaryRole')}</span>
                        <span className="text-right font-medium text-white/60">
                          {hoveredNode.roles
                            .filter((role) => role !== hoveredNode.primaryRole)
                            .map((role) => roleLabels[role])
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {hoveredNode.level !== null && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/35">{t('tooltipLevel')}</span>
                        <span className="font-semibold text-[#f0c75e]">
                          M{hoveredNode.level}
                        </span>
                      </div>
                    )}
                    {hoveredNode.points !== null && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/35">{t('tooltipPoints')}</span>
                        <span className="font-semibold tabular-nums text-white/80">
                          {numberFormatter.format(hoveredNode.points)}
                        </span>
                      </div>
                    )}
                    {hoveredNode.points === null && hoveredNode.level === null && (
                      <p className="border-t border-white/[0.06] pt-1.5 text-[9px] leading-relaxed text-white/30">
                        {t('tooltipNoMastery')}
                      </p>
                    )}
                    {mode === 'explore' && (
                      <p className="border-t border-white/[0.06] pt-1.5 text-[9px] leading-relaxed text-white/30">
                        {t('tooltipExploreHint')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isEmptyPersonal && (
                <div className="absolute inset-0 z-10 flex items-center justify-center p-5">
                  <div className="max-w-sm rounded-2xl border border-[#c89b3c]/20 bg-[#0a0616]/90 p-6 text-center shadow-2xl backdrop-blur">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#f0c75e]/25 bg-[#f0c75e]/10 text-[#f0c75e]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <h3
                      className="mt-4 text-2xl text-[#fff8e6]"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t('emptyPersonalTitle')}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/40">
                      {t('emptyPersonalBody')}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => openPersonalize(null)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#c89b3c]/40 bg-[#c89b3c]/15 px-3 py-2 text-[10px] font-semibold text-[#f0c75e] transition hover:bg-[#c89b3c]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t('emptyPersonalCta')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMode('explore')}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold text-white/55 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                      >
                        {t('emptyPersonalExplore')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isEmptyFilter && (
                <div className="absolute inset-0 z-10 flex items-center justify-center p-5">
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0a0616]/90 px-6 py-5 text-center backdrop-blur">
                    <Search className="mx-auto h-6 w-6 text-white/20" />
                    <p className="mt-2 text-xs text-white/45">{t('searchNoResults')}</p>
                    <button
                      type="button"
                      onClick={() => handleRoleFilter('all')}
                      className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-semibold text-white/55 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                    >
                      {t('roleAll')}
                    </button>
                  </div>
                </div>
              )}

              {loading && !catalog && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#05030d]/80">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#f0c75e]" />
                    <p className="mt-3 text-sm font-semibold text-white/70">
                      {t('loadingTitle')}
                    </p>
                    <p className="mt-1 text-xs text-white/30">{t('loadingBody')}</p>
                  </div>
                </div>
              )}

              {loadError && !loading && !catalog && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#05030d]/90 p-5">
                  <div className="max-w-sm rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6 text-center">
                    <AlertTriangle className="mx-auto h-7 w-7 text-red-300/80" />
                    <p className="mt-3 text-sm font-semibold text-white/80">
                      {t('loadErrorTitle')}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/35">
                      {t('loadErrorBody')}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setCatalogLocale(null); setLoadError(false); setReloadKey((key) => key + 1) }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {t('retry')}
                    </button>
                  </div>
                </div>
              )}

              {selectedChampion && (
                <div className="pointer-events-none absolute bottom-3 left-3 hidden max-w-[260px] rounded-xl border border-[#c89b3c]/20 bg-black/55 px-3 py-2 backdrop-blur sm:block">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#f0c75e]/65">
                    {selectedRank !== null
                      ? t('detailsRank', {
                          rank: selectedRank,
                          total: layout.nodes.length,
                        })
                      : t('centerChampion')}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-white/70">
                    {selectedChampion.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectChampion(selectedChampion, 'tree')}
                    className="pointer-events-auto mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-[#f0c75e]/70 transition hover:text-[#f0c75e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                  >
                    {t('openDetails')}
                    <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-[#05030d] via-[#05030d]/70 to-transparent px-4 pb-3 pt-8 text-center">
                <p className="text-[9px] text-white/30 sm:text-[10px]">
                  <span className="hidden sm:inline">{t('treeHint')}</span>
                  <span className="sm:hidden">{t('treeHintMobile')}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 pb-1 pt-3 text-[9px] text-white/25 sm:px-3">
              <span className="inline-flex items-center gap-1">
                <Move className="h-3 w-3" />
                {t('instructionsMouse')}
              </span>
              <span className="inline-flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                {t('zoomToNames')}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-6" aria-labelledby="mt-directory-title">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setDirectoryOpen((value) => !value)}
              aria-expanded={directoryOpen}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f0c75e]/40 sm:px-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/45">
                <Layers className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  id="mt-directory-title"
                  className="block text-sm font-semibold text-white/80"
                >
                  {t('directoryTitle')}
                </span>
                <span className="mt-0.5 block text-[10px] text-white/30">
                  {t('directoryBody')}
                </span>
              </span>
              <span className="shrink-0 text-[10px] font-semibold text-white/30">
                {directoryOpen ? t('directoryToggleClose') : t('directoryToggleOpen')}
              </span>
              <ChevronDown
                className={[
                  'h-4 w-4 shrink-0 text-white/30 transition',
                  directoryOpen ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {directoryOpen && (
              <div className="border-t border-white/[0.06] p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="relative block max-w-xs flex-1">
                    <span className="sr-only">{t('directorySearch')}</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <input
                      value={directoryQuery}
                      onChange={(event) => setDirectoryQuery(event.target.value)}
                      placeholder={t('directorySearch')}
                      className="h-9 w-full rounded-xl border border-white/10 bg-black/25 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-[#c89b3c]/45 focus:ring-1 focus:ring-[#c89b3c]/20"
                    />
                  </label>
                  <p className="text-[10px] text-white/30">
                    {t('searchMatches', { count: directoryChampions.length })}
                  </p>
                </div>

                {directoryChampions.length > 0 ? (
                  <div className="mt-3 grid max-h-[420px] grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {directoryChampions.map((champion) => {
                      const role = ROLE_COLORS[champion.primaryRole]
                      return (
                        <button
                          key={champion.championId}
                          type="button"
                          onClick={() => handleSelectChampion(champion, 'directory')}
                          className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 text-left transition hover:border-white/15 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/40"
                        >
                          <span
                            className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border"
                            style={{ borderColor: `${role.color}55` }}
                          >
                            <Image
                              src={championIconUrl(champion.key)}
                              alt=""
                              fill
                              sizes="32px"
                              className="object-cover"
                              loading="lazy"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-semibold text-white/75">
                              {champion.name}
                            </span>
                            <span
                              className="block truncate text-[8px] font-semibold uppercase tracking-[0.12em]"
                              style={{ color: role.color }}
                            >
                              {t(`roles.${champion.primaryRole}`)}
                            </span>
                          </span>
                          {masteries[champion.championId]?.level !== null &&
                            masteries[champion.championId]?.level !== undefined && (
                              <span className="shrink-0 text-[9px] font-bold text-[#f0c75e]">
                                M{masteries[champion.championId].level}
                              </span>
                            )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="mt-6 rounded-xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-xs text-white/30">
                    {t('directoryEmpty')}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="mt-legend-title">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#f0c75e]/30" />
            <h2
              id="mt-legend-title"
              className="text-center text-3xl text-[#fff8e6]"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {t('legendTitle')}
            </h2>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#f0c75e]/30" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#f0c75e]">
                <Expand className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white/80">
                {t('legendSizeTitle')}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">
                {t('legendSizeBody')}
              </p>
            </article>

            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#f0c75e]">
                <Layers className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white/80">
                {t('legendColorTitle')}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">
                {t('legendColorBody')}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {EXPLORER_ROLES.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold"
                    style={{
                      borderColor: `${ROLE_COLORS[role].color}44`,
                      color: ROLE_COLORS[role].color,
                      backgroundColor: ROLE_COLORS[role].soft,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: ROLE_COLORS[role].color }}
                    />
                    {t(`roles.${role}`)}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#f0c75e]">
                <GitBranch className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white/80">
                {t('legendBranchTitle')}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">
                {t('legendBranchBody')}
              </p>
            </article>

            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#f0c75e]">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white/80">
                {t('legendLevelTitle')}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">
                {t('legendLevelBody')}
              </p>
            </article>

            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#f0c75e]">
                <Crosshair className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white/80">
                {t('legendRootTitle')}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">
                {t('legendRootBody')}
              </p>
            </article>

            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#f0c75e]">
                <Hand className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white/80">
                {t('instructionsTitle')}
              </h3>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-white/35">
                <li className="flex gap-1.5">
                  <MousePointer2 className="mt-0.5 h-3 w-3 shrink-0 text-white/25" />
                  {t('instructionsMouse')}
                </li>
                <li className="flex gap-1.5">
                  <Hand className="mt-0.5 h-3 w-3 shrink-0 text-white/25" />
                  {t('instructionsTouch')}
                </li>
                <li className="flex gap-1.5">
                  <Keyboard className="mt-0.5 h-3 w-3 shrink-0 text-white/25" />
                  {t('instructionsKeyboard')}
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.035] to-transparent p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c89b3c]/25 bg-[#c89b3c]/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#f0c75e]/75">
                <Info className="h-3 w-3" />
                {t('dataSource', { version: DDRAGON_VERSION })}
              </span>
              <h2
                className="mt-4 text-4xl leading-[0.95] text-[#fff8e6]"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {t('howTitle')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/40">
                {t('howBody')}
              </p>
            </div>
            <div className="space-y-2.5">
              {[
                { key: '1', icon: Layers },
                { key: '2', icon: Check },
                { key: '3', icon: UserRound },
              ].map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="flex gap-3 rounded-2xl border border-white/[0.06] bg-black/15 p-3.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#f0c75e]/20 bg-[#f0c75e]/[0.06] text-[#f0c75e]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-white/80">
                      {t(`howPoint${key}Title`)}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                      {t(`howPoint${key}Body`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-[#c89b3c]/20 bg-[#c89b3c]/[0.05]">
          <div className="relative p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#f0c75e]/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <h2
                  className="text-3xl leading-none text-[#fff8e6]"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {t('shareSectionTitle')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {t('shareSectionBody')}
                </p>
              </div>
              <button
                type="button"
                onClick={openShare}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#c89b3c]/50 bg-[#c89b3c] px-5 py-3 text-sm font-bold text-[#120c04] shadow-[0_12px_40px_-14px_rgba(240,199,94,0.65)] transition hover:bg-[#e1b84e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/60"
              >
                <Share2 className="h-4 w-4" />
                {t('shareSectionCta')}
              </button>
            </div>
          </div>
        </section>

        <footer className="mb-12 mt-10 border-t border-white/[0.06] pt-6">
          <p className="text-[10px] leading-relaxed text-white/25">{t('disclaimer')}</p>
          <p className="mt-2 text-[10px] leading-relaxed text-white/20">
            {t('dataSource', { version: DDRAGON_VERSION })}
          </p>
        </footer>
      </div>

      <ChampionDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        champion={selectedChampion}
        mastery={selectedId !== null ? masteries[selectedId] : undefined}
        locale={locale}
        rank={selectedRank}
        total={layout.nodes.length}
        totalPoints={layout.totalPoints}
        onFocus={focusChampion}
        onPersonalize={(champion) => openPersonalize(champion.championId)}
        onRemove={removeMastery}
      />

      <PersonalizeModal
        open={personalizeOpen}
        onClose={() => {
          setPersonalizeOpen(false)
          setPersonalizeTarget(null)
        }}
        catalog={catalog ?? []}
        masteries={masteries}
        onChange={updateMasteries}
        locale={locale}
        initialChampionId={personalizeTarget}
        readOnlyMastery={readOnlyMastery}
      />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        mode={mode}
        locale={locale}
        layout={layout}
        roleLabels={roleLabels}
      />
    </main>
  )
}
