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

const championCache = new Map<string, ChampionMetaMap>()
const championRequests = new Map<string, Promise<ChampionMetaMap>>()

function ddragonDataLocale(locale: string): string {
  if (locale === 'es') return 'es_ES'
  return 'en_US'
}

export function championIconUrl(championKey: string): string {
  return `${DDRAGON_BASE}/img/champion/${championKey}.png`
}

export function championSplashUrl(championKey: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championKey}_0.jpg`
}

export function championLoadingUrl(championKey: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championKey}_0.jpg`
}

export function loadChampionData(locale = 'en'): Promise<ChampionMetaMap> {
  const dataLocale = ddragonDataLocale(locale)
  const cached = championCache.get(dataLocale)
  if (cached) return Promise.resolve(cached)

  const pending = championRequests.get(dataLocale)
  if (pending) return pending

  const request = fetch(
    `${DDRAGON_BASE}/data/${dataLocale}/champion.json`,
  )
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

      championCache.set(dataLocale, map)
      return map
    })
    .catch((error) => {
      championRequests.delete(dataLocale)
      throw error
    })

  championRequests.set(dataLocale, request)
  return request
}

export type { ChampionMeta }
