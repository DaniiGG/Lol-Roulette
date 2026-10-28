'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import {
  Check,
  Download,
  FileJson,
  Loader2,
  Plus,
  Search,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'
import AccessibleModal from './AccessibleModal'
import type {
  ChampionCatalogEntry,
  ExplorerRole,
  MasteryMap,
} from '@/lib/mastery-tree/explorer-types'
import { EXPLORER_ROLES } from '@/lib/mastery-tree/explorer-types'
import { MAX_MASTERY_POINTS } from '@/lib/mastery-tree/share-state'
import {
  MAX_IMPORT_BYTES,
  parseMasteryImport,
  type ImportErrorCode,
  type ImportedMasteryEntry,
} from '@/lib/mastery-tree/import'
import { ROLE_COLORS } from '@/lib/mastery-tree/visuals'
import { championIconUrl } from '@/lib/champion-data'
import { downloadBlob } from '@/lib/mastery-tree/share-card'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events'

const IMPORT_ERROR_KEYS: Record<ImportErrorCode, string> = {
  invalidJson: 'importErrorInvalidJson',
  shape: 'importErrorShape',
  noEntries: 'importErrorNoEntries',
  tooLarge: 'importErrorTooLarge',
  tooMany: 'importErrorTooMany',
  points: 'importErrorPoints',
  level: 'importErrorLevel',
}

type ImportStatus =
  | { type: 'idle' }
  | { type: 'working' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

interface PersonalizeModalProps {
  open: boolean
  onClose: () => void
  catalog: ChampionCatalogEntry[]
  masteries: MasteryMap
  onChange: (next: MasteryMap) => void
  locale: string
  initialChampionId?: number | null
  readOnlyMastery?: boolean
}

function PointsInput({
  value,
  onCommit,
  label,
  placeholder,
  invalidText,
  disabled = false,
}: {
  value: number | null
  onCommit: (value: number | null) => void
  label: string
  placeholder: string
  invalidText: string
  disabled?: boolean
}) {
  const [draft, setDraft] = useState(value !== null ? String(value) : '')
  const [invalid, setInvalid] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setDraft(value !== null ? String(value) : '')
    setInvalid(false)
  }, [value])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.replace(/[^\d]/g, '')
    setDraft(next)

    if (next === '') {
      setInvalid(false)
      onCommit(null)
      return
    }

    const parsed = Number(next)
    if (!Number.isFinite(parsed) || parsed > MAX_MASTERY_POINTS) {
      setInvalid(true)
      return
    }

    setInvalid(false)
    onCommit(parsed)
  }

  return (
    <label className="block">
      <span className="sr-only">{label}</span>
        <input
          value={draft}
          onChange={handleChange}
          inputMode="numeric"
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className={[
          'h-9 w-full rounded-lg border bg-black/25 px-2.5 text-right text-xs text-white outline-none transition placeholder:text-white/25 focus:ring-1',
          invalid
            ? 'border-red-400/60 focus:border-red-400/70 focus:ring-red-400/20'
            : 'border-white/10 focus:border-[#c89b3c]/50 focus:ring-[#c89b3c]/20',
        ].join(' ')}
      />
      {invalid && <span className="mt-1 block text-[9px] text-red-300">{invalidText}</span>}
    </label>
  )
}

export default function PersonalizeModal({
  open,
  onClose,
  catalog,
  masteries,
  onChange,
  locale,
  initialChampionId = null,
  readOnlyMastery = false,
}: PersonalizeModalProps) {
  const t = useTranslations('masteryTreeExplorer')
  const [tab, setTab] = useState<'manual' | 'import'>('manual')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<ExplorerRole | 'all'>('all')
  const [importStatus, setImportStatus] = useState<ImportStatus>({ type: 'idle' })
  const [riotLoading, setRiotLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    setHasSession(Boolean(Cookies.get('session_token')))
  }, [open])

  useEffect(() => {
    if (!open || !initialChampionId) return
    const champion = catalog.find((item) => item.championId === initialChampionId)
    setTab('manual')
    setQuery(champion?.name ?? '')
    window.setTimeout(() => searchRef.current?.focus(), 80)
  }, [open, initialChampionId, catalog])
  /* eslint-enable react-hooks/set-state-in-effect */

  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])
  const catalogById = useMemo(
    () => new Map(catalog.map((champion) => [champion.championId, champion])),
    [catalog],
  )

  const selected = useMemo(() => {
    return Object.entries(masteries)
      .map(([id, value]) => ({
        champion: catalogById.get(Number(id)),
        value,
      }))
      .filter(
        (
          item,
        ): item is {
          champion: ChampionCatalogEntry
          value: (typeof item)['value']
        } => Boolean(item.champion),
      )
      .sort((a, b) => {
        const aPoints = a.value.points ?? -1
        const bPoints = b.value.points ?? -1
        if (aPoints !== bPoints) return bPoints - aPoints
        return a.champion.name.localeCompare(b.champion.name, locale)
      })
  }, [masteries, catalogById, locale])

  const totalPoints = useMemo(
    () =>
      selected.reduce(
        (total, item) => total + (item.value.points ?? 0),
        0,
      ),
    [selected],
  )

  const filteredCatalog = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return catalog.filter((champion) => {
      if (roleFilter !== 'all' && !champion.roles.includes(roleFilter)) {
        return false
      }
      if (!normalized) return true
      return (
        champion.name.toLowerCase().includes(normalized) ||
        champion.key.toLowerCase().includes(normalized) ||
        champion.title.toLowerCase().includes(normalized)
      )
    })
  }, [catalog, query, roleFilter])

  const updateValue = (championId: number, patch: Partial<{ points: number | null; level: number | null }>) => {
    const current = masteries[championId] ?? { points: null, level: null }
    onChange({
      ...masteries,
      [championId]: {
        points: patch.points !== undefined ? patch.points : current.points,
        level: patch.level !== undefined ? patch.level : current.level,
      },
    })
  }

  const addChampion = (champion: ChampionCatalogEntry) => {
    if (masteries[champion.championId]) return
    onChange({
      ...masteries,
      [champion.championId]: { points: null, level: null },
    })
  }

  const removeChampion = (championId: number) => {
    const next = { ...masteries }
    delete next[championId]
    onChange(next)
  }

  const clearAll = () => {
    onChange({})
    setImportStatus({ type: 'idle' })
  }

  const applyImported = (entries: ImportedMasteryEntry[]) => {
    const knownIds = new Set(catalog.map((champion) => champion.championId))
    const next: MasteryMap = {}
    let skipped = 0

    for (const entry of entries) {
      if (!knownIds.has(entry.championId)) {
        skipped += 1
        continue
      }
      next[entry.championId] = {
        points: entry.points,
        level: entry.level,
      }
    }

    const count = Object.keys(next).length
    if (!count) {
      setImportStatus({ type: 'error', message: t('importErrorNoMatch') })
      return
    }

    onChange(next)
    setImportStatus({
      type: 'success',
      message:
        skipped > 0
          ? t('importSuccessWithSkipped', { count, skipped })
          : t('importSuccess', { count }),
    })
    trackEvent(ANALYTICS_EVENTS.importSuccess)
  }

  const handleFile = async (file: File) => {
    if (file.size > MAX_IMPORT_BYTES) {
      setImportStatus({ type: 'error', message: t('importErrorTooLarge') })
      return
    }

    setImportStatus({ type: 'working' })
    try {
      const text = await file.text()
      const result = parseMasteryImport(text, file.size)
      if (!result.ok) {
        setImportStatus({
          type: 'error',
          message: t(IMPORT_ERROR_KEYS[result.code]),
        })
        return
      }
      applyImported(result.entries)
    } catch {
      setImportStatus({ type: 'error', message: t('importErrorRead') })
    }
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const downloadTemplate = () => {
    const sample = {
      version: 1,
      champions: [
        { championId: 103, championLevel: 7, championPoints: 125000 },
        { championId: 64, championLevel: 6, championPoints: 82000 },
        { championId: 157, championLevel: 5, championPoints: 41000 },
        { championId: 222, championLevel: 4, championPoints: 18500 },
        { championId: 412, championLevel: 7, championPoints: 96000 },
      ],
    }
    const blob = new Blob([JSON.stringify(sample, null, 2)], {
      type: 'application/json',
    })
    downloadBlob(blob, t('importTemplateFile'))
  }

  const importFromRiot = async () => {
    const token = Cookies.get('session_token')
    if (!token) {
      setImportStatus({ type: 'error', message: t('importRiotError') })
      return
    }

    setRiotLoading(true)
    setImportStatus({ type: 'working' })

    try {
      const verifyResponse = await fetch('/api/auth/verify-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!verifyResponse.ok) throw new Error('session')
      const verifyPayload = await verifyResponse.json()
      const user = verifyPayload?.user
      if (!user?.puuid || !user?.region) throw new Error('session')

      const masteryResponse = await fetch('/api/champion-mastery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ puuid: user.puuid, region: user.region }),
      })
      if (!masteryResponse.ok) throw new Error('mastery')
      const masteryPayload = await masteryResponse.json()
      const result = parseMasteryImport(
        JSON.stringify(masteryPayload?.masteries ?? []),
      )
      if (!result.ok) {
        setImportStatus({ type: 'error', message: t('importRiotError') })
        return
      }

      applyImported(result.entries)
      setImportStatus({
        type: 'success',
        message: t('importRiotSuccess', { count: result.entries.length }),
      })
    } catch {
      setImportStatus({ type: 'error', message: t('importRiotError') })
    } finally {
      setRiotLoading(false)
    }
  }

  return (
    <AccessibleModal
      open={open}
      onClose={onClose}
      titleId="mt-personalize-title"
      closeLabel={t('personalizeClose')}
      className="sm:max-w-5xl"
    >
      <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f0c75e]/75">
          {t('personalize')}
        </p>
        <h2
          id="mt-personalize-title"
          className="mt-1 text-3xl text-white"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
        >
          {t('personalizeTitle')}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/45">
          {t('personalizeIntro')}
        </p>
      </div>

      <div
        className="flex gap-1 border-b border-white/[0.06] px-5 pt-3 sm:px-7"
        role="tablist"
        aria-label={t('personalizeTitle')}
      >
        {(['manual', 'import'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={[
              'relative rounded-t-lg px-4 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
              tab === item
                ? 'text-[#f0c75e]'
                : 'text-white/40 hover:text-white/70',
            ].join(' ')}
            aria-selected={tab === item}
            role="tab"
          >
            {item === 'manual' ? t('personalizeTabManual') : t('personalizeTabImport')}
            {tab === item && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#f0c75e]" />
            )}
          </button>
        ))}
      </div>

      {tab === 'manual' ? (
        <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">
                {t('personalizeSelected', { count: selected.length })}
              </h3>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] font-semibold text-white/35 transition hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                >
                  {t('personalizeClear')}
                </button>
              )}
            </div>

            {selected.length > 0 ? (
              <div className="mt-3 space-y-2">
                {selected.map(({ champion, value }) => {
                  const role = ROLE_COLORS[champion.primaryRole]
                  return (
                    <div
                      key={champion.championId}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border"
                          style={{ borderColor: `${role.color}66` }}
                        >
                          <Image
                            src={championIconUrl(champion.key)}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-white">
                            {champion.name}
                          </span>
                          <span
                            className="block text-[9px] font-semibold uppercase tracking-[0.14em]"
                            style={{ color: role.color }}
                          >
                            {t(`roles.${champion.primaryRole}`)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeChampion(champion.championId)}
                          aria-label={t('personalizeRemove', { name: champion.name })}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/25 transition hover:bg-red-400/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-[1fr_86px] gap-2">
                        <PointsInput
                          value={value.points}
                          onCommit={(points) =>
                            updateValue(champion.championId, { points })
                          }
                          label={`${t('personalizePoints')} — ${champion.name}`}
                          placeholder={t('personalizePointsPlaceholder')}
                          invalidText={t('personalizePointsInvalid')}
                          disabled={readOnlyMastery}
                        />
                        <select
                          value={value.level ?? ''}
                          onChange={(event) =>
                            updateValue(champion.championId, {
                              level:
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value),
                            })
                          }
                          disabled={readOnlyMastery}
                          aria-label={`${t('personalizeLevel')} — ${champion.name}`}
                          className="h-9 rounded-lg border border-white/10 bg-black/25 px-2 text-xs text-white outline-none transition focus:border-[#c89b3c]/50 focus:ring-1 focus:ring-[#c89b3c]/20"
                        >
                          <option value="">{t('personalizeLevelUnknown')}</option>
                          {Array.from({ length: 10 }, (_, index) => index + 1).map(
                            (level) => (
                              <option key={level} value={level}>
                                M{level}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                  )
                })}
                <p className="pt-1 text-[10px] font-semibold text-[#f0c75e]/75">
                  {t('personalizeTotal', {
                    points: numberFormatter.format(totalPoints),
                  })}
                </p>
              </div>
            ) : (
              <div className="mt-3 flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] px-6 text-center">
                <UserRound className="h-8 w-8 text-white/15" />
                <p className="mt-3 text-sm font-semibold text-white/55">
                  {t('personalizeSelectedEmpty')}
                </p>
                <p className="mt-1 max-w-[240px] text-[11px] leading-relaxed text-white/30">
                  {t('personalizeSelectedEmptyBody')}
                </p>
              </div>
            )}
          </section>

          <section className="min-w-0">
            <label className="block">
              <span className="sr-only">{t('personalizeSearchLabel')}</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('personalizeSearchPlaceholder')}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/25 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c89b3c]/45 focus:ring-1 focus:ring-[#c89b3c]/20"
                />
              </span>
            </label>

            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={t('roleFilterLabel')}>
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={[
                  'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
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
                    onClick={() => setRoleFilter(role)}
                    className={[
                      'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50',
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

            <div className="mt-3 max-h-[360px] space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-white/[0.06] bg-black/15 p-1.5">
              {filteredCatalog.length > 0 ? (
                filteredCatalog.map((champion) => {
                  const added = Boolean(masteries[champion.championId])
                  const role = ROLE_COLORS[champion.primaryRole]
                  return (
                    <button
                      key={champion.championId}
                      type="button"
                      onClick={() => addChampion(champion)}
                      disabled={added}
                      className={[
                        'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition',
                        added
                          ? 'cursor-default bg-white/[0.03]'
                          : 'hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/40',
                      ].join(' ')}
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
                      <span
                        className={[
                          'flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[9px] font-bold',
                          added
                            ? 'border-[#5ee0a0]/40 bg-[#5ee0a0]/10 text-[#5ee0a0]'
                            : 'border-white/10 text-white/40',
                        ].join(' ')}
                      >
                        {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </span>
                    </button>
                  )
                })
              ) : (
                <p className="px-3 py-8 text-center text-xs text-white/30">
                  {t('personalizeNoResults')}
                </p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-5 p-5 sm:p-7">
          <section>
            <h3 className="text-sm font-semibold text-white">{t('importTitle')}</h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/40">
              {t('importIntro')}
            </p>

            <label
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={[
                'mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-9 text-center transition',
                dragging
                  ? 'border-[#f0c75e]/60 bg-[#f0c75e]/[0.07]'
                  : 'border-white/[0.12] bg-white/[0.02] hover:border-[#c89b3c]/40 hover:bg-[#c89b3c]/[0.04]',
              ].join(' ')}
            >
              <UploadCloud className="h-8 w-8 text-[#f0c75e]/55" />
              <span className="mt-3 text-sm font-semibold text-white/75">
                {t('importDrop')}
              </span>
              <span className="mt-1 text-[10px] text-white/30">
                {t('importFileHint')}
              </span>
              <span className="mt-4 rounded-full border border-[#c89b3c]/35 bg-[#c89b3c]/10 px-4 py-1.5 text-[10px] font-semibold text-[#f0c75e]">
                {t('importChoose')}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleFile(file)
                  event.target.value = ''
                }}
              />
            </label>

            <p className="mt-2 text-[10px] leading-relaxed text-white/30">
              {t('importSupportedFormat')}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold text-white/60 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
              >
                <FileJson className="h-3.5 w-3.5" />
                {t('importChoose')}
              </button>
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold text-white/60 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
              >
                <Download className="h-3.5 w-3.5" />
                {t('importTemplate')}
              </button>
            </div>

            <p className="mt-3 text-[10px] text-[#f0c75e]/55">{t('importReplaceNote')}</p>

            {importStatus.type !== 'idle' && (
              <div
                role="status"
                aria-live="polite"
                className={[
                  'mt-3 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-xs',
                  importStatus.type === 'error'
                    ? 'border-red-400/25 bg-red-400/[0.06] text-red-200'
                    : importStatus.type === 'success'
                      ? 'border-[#5ee0a0]/25 bg-[#5ee0a0]/[0.06] text-[#9df0c5]'
                      : 'border-white/10 bg-white/[0.03] text-white/50',
                ].join(' ')}
              >
                {importStatus.type === 'working' ? (
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
                ) : importStatus.type === 'success' ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>
                  {importStatus.type === 'working'
                    ? t('importRiotLoading')
                    : importStatus.message}
                </span>
              </div>
            )}
          </section>

          {hasSession && !readOnlyMastery && (
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f0c75e]/25 bg-[#f0c75e]/10 text-[#f0c75e]">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white">{t('importRiotTitle')}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/40">
                    {t('importRiotBody')}
                  </p>
                  <button
                    type="button"
                    onClick={() => void importFromRiot()}
                    disabled={riotLoading}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#c89b3c]/35 bg-[#c89b3c]/10 px-3.5 py-2 text-[10px] font-semibold text-[#f0c75e] transition hover:bg-[#c89b3c]/20 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
                  >
                    {riotLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {riotLoading ? t('importRiotLoading') : t('importRiotButton')}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="max-w-lg text-[10px] leading-relaxed text-white/30">
          {t('personalizePrivacy')}
        </p>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {tab === 'import' && importStatus.type === 'success' && (
            <span className="text-[10px] font-semibold text-[#5ee0a0]">
              {importStatus.message}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#c89b3c]/40 bg-[#c89b3c]/12 px-4 py-2 text-xs font-semibold text-[#f0c75e] transition hover:bg-[#c89b3c]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
          >
            {t('personalizeDone')}
          </button>
        </div>
      </div>
    </AccessibleModal>
  )
}
