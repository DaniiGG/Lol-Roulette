import { getChampionsByLane, normalizeChampionName } from './champion-lanes'

const STORAGE_KEY = 'lol_roulette_champion_pool'

export type ChampionPool = Record<string, string[]>

export function loadChampionPool(): ChampionPool {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveChampionPool(pool: ChampionPool): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pool))
}

export function getPoolForLane(pool: ChampionPool, lane: string): string[] | null {
  if (lane === 'all') {
    const all = Object.values(pool).flat()
    return all.length > 0 ? [...new Set(all)] : null
  }
  const lanePool = pool[lane]
  return lanePool && lanePool.length >= 5 ? lanePool : null
}

export const ACCOUNT_POOL_SIZES = [5, 10, 20, 30, 'all'] as const
export const ACCOUNT_POOL_PRESETS = [...ACCOUNT_POOL_SIZES, 'mastery7', 'mastery5', 'below5'] as const
export type AccountPoolPreset = typeof ACCOUNT_POOL_PRESETS[number]
export type AccountChampion = { name: string; level: number }
export const POOL_LANES = ['top', 'jungle', 'mid', 'adc', 'support'] as const
export const DEFAULT_ACCOUNT_POOL_PRESET = 10

export function championSearchKey(name: string): string {
  return normalizeChampionName(name).toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function buildAccountPool(championsByMastery: AccountChampion[], preset: AccountPoolPreset): ChampionPool {
  let ranked = championsByMastery
  if (preset === 'mastery7') ranked = ranked.filter(champion => champion.level >= 7)
  if (preset === 'mastery5') ranked = ranked.filter(champion => champion.level >= 5)
  if (preset === 'below5') ranked = ranked.filter(champion => champion.level < 5)

  return Object.fromEntries(['all', ...POOL_LANES].map(lane => {
    const laneNames = lane === 'all' ? null : new Set(getChampionsByLane(lane).map(championSearchKey))
    const names = ranked.filter(champion => !laneNames || laneNames.has(championSearchKey(champion.name)))
      .map(champion => champion.name)
    return [lane, typeof preset === 'number' ? names.slice(0, preset) : names]
  }))
}

export function getLanesWithPool(pool: ChampionPool): string[] {
  return Object.entries(pool)
    .filter(([_, champs]) => champs.length >= 5)
    .map(([lane]) => lane)
}
