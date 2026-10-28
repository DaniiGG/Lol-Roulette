import { CHAMPION_LANES } from '@/lib/champion-lanes'
import type { ChampionMetaMap } from './types'
import {
  EXPLORER_ROLES,
  type ChampionCatalogEntry,
  type ExplorerRole,
} from './explorer-types'

const KEY_ALIASES: Record<string, string> = {
  monkeyking: 'Wukong',
  nunu: 'Nunu & Willump',
  renata: 'Renata Glasc',
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const LANES_BY_KEY = new Map<string, ExplorerRole[]>()

for (const [name, lanes] of Object.entries(CHAMPION_LANES)) {
  const roles = lanes.filter((lane): lane is ExplorerRole =>
    (EXPLORER_ROLES as readonly string[]).includes(lane),
  )
  if (roles.length) LANES_BY_KEY.set(normalize(name), roles)
}

function rolesFromTags(tags: string[]): ExplorerRole[] {
  const roles = new Set<ExplorerRole>()

  for (const tag of tags) {
    if (tag === 'Support') roles.add('support')
    if (tag === 'Marksman') roles.add('adc')
    if (tag === 'Assassin' || tag === 'Mage') roles.add('mid')
    if (tag === 'Tank' || tag === 'Fighter') roles.add('top')
  }

  if (!roles.size) roles.add('top')
  return Array.from(roles)
}

export function resolveRoles(key: string, name: string, tags: string[]): ExplorerRole[] {
  const alias = KEY_ALIASES[normalize(key)]
  const candidates = [alias, name, key].filter(Boolean) as string[]

  for (const candidate of candidates) {
    const roles = LANES_BY_KEY.get(normalize(candidate))
    if (roles?.length) return roles
  }

  return rolesFromTags(tags)
}

export function buildChampionCatalog(
  championMeta: ChampionMetaMap,
): ChampionCatalogEntry[] {
  return Object.entries(championMeta)
    .map(([rawId, meta]) => {
      const championId = Number(rawId)
      const roles = resolveRoles(meta.key, meta.name, meta.tags)

      return {
        championId,
        key: meta.key,
        name: meta.name,
        title: meta.title,
        tags: meta.tags,
        roles,
        primaryRole: roles[0],
      }
    })
    .filter((champion) => Number.isFinite(champion.championId))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
}
