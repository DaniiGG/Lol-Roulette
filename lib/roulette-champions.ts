import 'server-only'
import { getChampionsByLane, normalizeChampionName } from './champion-lanes'
import champions from './roulette-champions.json'

export function getRouletteChampions(lane: string) {
  const ids = new Set(getChampionsByLane(lane).map(normalizeChampionName))
  const matches = champions.filter(champion => ids.has(champion.id))
  return matches.length ? matches : champions
}
