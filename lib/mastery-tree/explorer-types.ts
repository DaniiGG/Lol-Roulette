export const EXPLORER_ROLES = ['top', 'jungle', 'mid', 'adc', 'support'] as const

export type ExplorerRole = (typeof EXPLORER_ROLES)[number]

export type ExplorerMode = 'explore' | 'personal'

export interface ChampionCatalogEntry {
  championId: number
  key: string
  name: string
  title: string
  tags: string[]
  roles: ExplorerRole[]
  primaryRole: ExplorerRole
}

export interface MasteryValue {
  points: number | null
  level: number | null
}

export type MasteryMap = Record<number, MasteryValue>

export interface ExplorerNode {
  id: number
  championId: number
  key: string
  name: string
  title: string
  tags: string[]
  roles: ExplorerRole[]
  primaryRole: ExplorerRole
  points: number | null
  level: number | null
  share: number
  radius: number
  x: number
  y: number
  rank: number
  roleRank: number
  delay: number
  isCenter: boolean
}

export interface ExplorerRoleHub {
  role: ExplorerRole
  x: number
  y: number
  radius: number
  angle: number
  count: number
}

export interface ExplorerEdge {
  id: string
  path: string
  color: string
  width: number
  delay: number
  kind: 'trunk' | 'branch'
  role: ExplorerRole
  targetId: number | null
}

export interface ExplorerLayout {
  nodes: ExplorerNode[]
  hubs: ExplorerRoleHub[]
  edges: ExplorerEdge[]
  extent: number
  totalPoints: number
  maxPoints: number
  centerNodeId: number | null
  mode: ExplorerMode
  roleCounts: Record<ExplorerRole, number>
}

export const EMPTY_LAYOUT: ExplorerLayout = {
  nodes: [],
  hubs: [],
  edges: [],
  extent: 420,
  totalPoints: 0,
  maxPoints: 0,
  centerNodeId: null,
  mode: 'explore',
  roleCounts: { top: 0, jungle: 0, mid: 0, adc: 0, support: 0 },
}
