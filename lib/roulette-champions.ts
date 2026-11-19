import 'server-only'
import { getChampionsByLane, normalizeChampionName } from './champion-lanes'
import { skinCatalog } from './skins/data'

export function getRouletteChampions(lane: string) {
  const ids = new Set(getChampionsByLane(lane).map(normalizeChampionName))
  const matches = skinCatalog.champions.filter(champion => ids.has(champion.id))
  return matches.length ? matches : skinCatalog.champions
}
