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

export function getLanesWithPool(pool: ChampionPool): string[] {
  return Object.entries(pool)
    .filter(([_, champs]) => champs.length >= 5)
    .map(([lane]) => lane)
}
