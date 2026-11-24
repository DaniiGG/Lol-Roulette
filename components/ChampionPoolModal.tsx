'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { championIconUrl, loadChampionData } from '@/lib/champion-data'
import { getChampionsByLane } from '@/lib/champion-lanes'
import {
  ACCOUNT_POOL_PRESETS, DEFAULT_ACCOUNT_POOL_PRESET, POOL_LANES, buildAccountPool,
  championSearchKey, loadChampionPool, saveChampionPool,
  type AccountChampion, type ChampionPool,
} from '@/lib/champion-pool'

interface ChampionPoolModalProps {
  onClose: () => void
  onSave: (pool: ChampionPool) => void
  account?: { token: string; puuid: string; region: string } | null
  profileLoading?: boolean
  onLogin?: () => void
  selectedLane?: string
  accountChampions?: AccountChampion[] | null
  accountPool?: ChampionPool | null
  editingAccountPool?: boolean
  onLoadAccount?: (champions: AccountChampion[]) => void
  onUseAccount?: (pool: ChampionPool) => void
}

export default function ChampionPoolModal({
  onClose, onSave, account, profileLoading, onLogin, selectedLane = 'top',
  accountChampions, accountPool, editingAccountPool, onLoadAccount, onUseAccount,
}: ChampionPoolModalProps) {
  const t = useTranslations('championPool')
  const tLanes = useTranslations('laneSelector')
  const [manualPool, setManualPool] = useState<ChampionPool>(loadChampionPool)
  const [accountDraft, setAccountDraft] = useState<ChampionPool | null>(accountPool ?? null)
  const [accountMode, setAccountMode] = useState(!!(editingAccountPool && accountDraft))
  const [activeLane, setActiveLane] = useState(selectedLane === 'all' && !accountMode ? 'top' : selectedLane)
  const [search, setSearch] = useState('')
  const [portraits, setPortraits] = useState<Record<string, string>>({})
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState<'error' | 'empty' | null>(null)
  const [preset, setPreset] = useState(editingAccountPool ? '' : String(DEFAULT_ACCOUNT_POOL_PRESET))
  const accountRequest = useRef<AbortController | null>(null)
  const pool = accountMode ? accountDraft ?? {} : manualPool
  const lanes = accountMode ? ['all', ...POOL_LANES] : POOL_LANES
  const lane = accountMode || activeLane !== 'all' ? activeLane : 'top'
  const query = search.toLowerCase().replace(/[^a-z0-9]/g, '')
  const laneChampions = getChampionsByLane(lane)
  const levels = new Map(accountChampions?.map(champion => [championSearchKey(champion.name), champion.level]))
  const eligible = accountMode
    ? lane === 'all'
      ? accountChampions?.map(champion => champion.name) ?? []
      : laneChampions.filter(name => levels.has(championSearchKey(name)))
    : laneChampions
  const champions = eligible.filter(name =>
    name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(query) || championSearchKey(name).includes(query),
  )
  const selectedKeys = new Set(pool[lane]?.map(championSearchKey))

  useEffect(() => () => accountRequest.current?.abort(), [])

  useEffect(() => {
    let active = true
    loadChampionData().then(data => {
      if (active) setPortraits(Object.fromEntries(
        Object.values(data).map(champion => [championSearchKey(champion.name), champion.key]),
      ))
    }).catch(() => { /* Champion names remain available. */ })
    return () => { active = false }
  }, [])

  const handleEditAccount = async () => {
    if (!account || !onLoadAccount || accountRequest.current) return
    if (accountChampions) {
      setAccountDraft(accountDraft ?? buildAccountPool(accountChampions, DEFAULT_ACCOUNT_POOL_PRESET))
      setActiveLane(selectedLane)
      setAccountMode(true)
      return
    }
    const controller = new AbortController()
    accountRequest.current = controller
    setAccountLoading(true)
    setAccountError(null)
    try {
      const { token, puuid, region } = account
      const [response, championData] = await Promise.all([
        fetch('/api/champion-mastery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ puuid, region }),
          signal: controller.signal,
        }),
        loadChampionData(),
      ])
      if (!response.ok) throw new Error('Could not load champion mastery')
      const { masteries } = await response.json() as {
        masteries: { championId: number; championPoints: number; championLevel: number }[]
      }
      if (controller.signal.aborted) return
      const ranked = masteries
        .filter(mastery => mastery.championPoints > 0 && championData[mastery.championId])
        .sort((a, b) => b.championPoints - a.championPoints)
        .map(mastery => ({ name: championData[mastery.championId].name, level: mastery.championLevel }))
      if (!ranked.length) {
        setAccountError('empty')
        return
      }
      onLoadAccount(ranked)
      setAccountDraft(buildAccountPool(ranked, DEFAULT_ACCOUNT_POOL_PRESET))
      setActiveLane(selectedLane)
      setAccountMode(true)
    } catch {
      if (!controller.signal.aborted) setAccountError('error')
    } finally {
      accountRequest.current = null
      if (!controller.signal.aborted) setAccountLoading(false)
    }
  }

  const toggleChampion = (champ: string) => {
    const update = (currentPool: ChampionPool | null) => {
      const current = currentPool?.[lane] ?? []
      const key = championSearchKey(champ)
      const next = current.some(name => championSearchKey(name) === key)
        ? current.filter(name => championSearchKey(name) !== key)
        : [...current, champ]
      return { ...currentPool, [lane]: next }
    }
    if (accountMode) {
      setAccountDraft(update)
      setPreset('')
    }
    else setManualPool(update)
  }

  const selections = Object.values(pool).flat()
  const totalSelected = accountMode ? new Set(selections.map(championSearchKey)).size : selections.length
  const canSave = accountMode ? totalSelected > 0 : POOL_LANES.some(role => (pool[role]?.length ?? 0) >= 5)

  const handleSave = () => {
    if (accountMode) onUseAccount?.(pool)
    else {
      saveChampionPool(pool)
      onSave(pool)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="champion-pool-title" className="bg-neutral-900 rounded-3xl border border-neutral-800 max-w-3xl w-full max-h-[90dvh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <h2 id="champion-pool-title" className="text-2xl font-bold text-white">{t('title')}</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white text-xl">✕</button>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto">
          {onLogin && onUseAccount && <section className="m-4 rounded-xl border border-[#C89B3C]/40 bg-[#C89B3C]/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#f1d48e]">{t('account.title')}</h3>
                <p className="mt-1 text-sm text-neutral-300">{t('account.description')}</p>
                {accountMode && accountChampions && (
                  <label className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-200">
                    {t('account.criteria')}
                    <select
                      value={preset}
                      onChange={event => {
                        const selection = ACCOUNT_POOL_PRESETS.find(option => String(option) === event.target.value)
                        if (selection === undefined) return
                        setPreset(event.target.value)
                        setAccountDraft(buildAccountPool(accountChampions, selection))
                      }}
                      className="rounded-lg border border-[#C89B3C]/45 bg-neutral-900 px-3 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-[#C89B3C]"
                    >
                      <option value="" disabled>{t('account.custom')}</option>
                      {ACCOUNT_POOL_PRESETS.map(option => (
                        <option key={option} value={option}>
                          {typeof option === 'number' ? t('account.top', { count: option }) : t(`account.${option}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <button
                type="button"
                disabled={profileLoading || accountLoading}
                onClick={accountMode ? () => setAccountMode(false) : account ? handleEditAccount : onLogin}
                className="rounded-xl bg-[#C89B3C] px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-[#d9aa44] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B3C] disabled:opacity-50"
              >
                {t(profileLoading || accountLoading ? 'account.loading' : accountMode ? 'account.manual' : account ? 'account.edit' : 'account.login')}
              </button>
            </div>
            {accountError && <p role="alert" className="mt-2 text-sm text-amber-200">{t(`account.${accountError}`)}</p>}
          </section>}
          <div className="px-4 pb-3">
            <p className="mb-2 text-sm text-neutral-400">{accountMode ? t('account.instructions') : t('desc', { min: 5 })}</p>
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label={t('search')}
              placeholder={t('search')}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-[#C89B3C]"
            />
          </div>
          <div className="flex border-t border-neutral-800">
            <div className="w-28 sm:w-40 flex-shrink-0 border-r border-neutral-800 p-2 space-y-1">
              {lanes.map(role => {
                const count = (pool[role] || []).length
                const valid = accountMode ? count > 0 : count >= 5
                return (
                  <button
                    key={role}
                    aria-pressed={lane === role}
                    onClick={() => setActiveLane(role)}
                    className={`w-full gap-1 px-2 py-2.5 rounded-xl text-start transition flex items-center justify-between ${
                      lane === role
                        ? 'bg-[#C89B3C]/20 border border-[#C89B3C]/40 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{tLanes(role === 'all' ? 'allLanes' : role)}</span>
                    <span className={`text-xs ${valid ? 'text-green-400' : 'text-neutral-500'}`}>
                      {accountMode ? count : `${count}/5`}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="min-w-0 flex-1 p-3 sm:p-4">
              {!champions.length && <p role="status" className="text-sm text-neutral-400">{t('noResults')}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {champions.map(champ => {
                  const key = championSearchKey(champ)
                  const selected = selectedKeys.has(key)
                  const portrait = portraits[key]
                  return (
                    <button
                      key={champ}
                      aria-pressed={selected}
                      onClick={() => toggleChampion(champ)}
                      className={`relative flex flex-col items-center gap-1.5 px-1 py-2 rounded-lg text-xs font-medium transition border ${
                        selected
                          ? 'bg-[#C89B3C]/20 border-[#C89B3C]/50 text-[#C89B3C]'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      {selected && <Check aria-hidden="true" size={13} className="absolute end-1 top-1" />}
                      {portrait && <Image src={championIconUrl(portrait)} alt="" width={36} height={36} loading="lazy" unoptimized className="rounded-md" />}
                      <span className="break-words max-w-full">{champ}</span>
                      {accountMode && <span className="text-neutral-400">{t('account.level', { count: levels.get(key) ?? 0 })}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 p-4">
          <div className="text-sm text-neutral-400">
            {t('totalSelected', { count: totalSelected })}
            {!accountMode && <span className="ml-2 text-neutral-600 text-xs">{t('minPerLane')}</span>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-sm">
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-2 rounded-xl bg-[#C89B3C] text-neutral-950 font-semibold hover:bg-[#d9aa44] disabled:opacity-40 text-sm"
            >
              {t(accountMode ? 'account.use' : 'save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
