import type { ChampionMeta, ChampionMetaMap } from './mastery-tree/types'

export const DDRAGON_VERSION = '16.21.1'

const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`

interface DDragonChampion {
  id: string
  key: string
  name: string
  title: string
  tags?: string[]
}

interface DDragonChampionPayload {
  data: Record<string, DDragonChampion>
}

let championCache: ChampionMetaMap | null = null
let championRequest: Promise<ChampionMetaMap> | null = null

export function championIconUrl(championKey: string): string {
  return `${DDRAGON_BASE}/img/champion/${championKey}.png`
}

export function loadChampionData(): Promise<ChampionMetaMap> {
  if (championCache) return Promise.resolve(championCache)
  if (championRequest) return championRequest

  championRequest = fetch(`${DDRAGON_BASE}/data/en_US/champion.json`)
    .then((response) => {
      if (!response.ok) throw new Error('Could not load champion artwork')
      return response.json() as Promise<DDragonChampionPayload>
    })
    .then((payload) => {
      const map: ChampionMetaMap = {}

      for (const champion of Object.values(payload.data)) {
        map[Number(champion.key)] = {
          key: champion.id,
          name: champion.name,
          title: champion.title,
          tags: champion.tags ?? [],
        }
      }

      championCache = map
      return map
    })
    .catch((error) => {
      championRequest = null
      throw error
    })

  return championRequest
}

export type { ChampionMeta }
