export interface MasteryEntry {
  championId: number
  championLevel: number
  championPoints: number
  championPointsUntilNextLevel: number
  championPointsSinceLastLevel: number
  tokensEarned: number
  lastPlayTime: number
}

export interface ChampionMeta {
  key: string
  name: string
  title: string
  tags: string[]
}

export type ChampionMetaMap = Record<number, ChampionMeta>

export type MasteryNodeTier = 'legend' | 'core' | 'branch' | 'outer'

export interface MasteryTreeNode {
  id: number
  championId: number
  championKey: string
  name: string
  title: string
  tags: string[]
  level: number
  points: number
  share: number
  radius: number
  x: number
  y: number
  layer: number
  rank: number
  parentId: number | null
  tier: MasteryNodeTier
  delay: number
  arm: number
}

export interface MasteryTreeEdge {
  id: string
  sourceId: number
  targetId: number
  path: string
  layer: number
  color: string
  width: number
  delay: number
}

export interface MasteryTreeLayout {
  nodes: MasteryTreeNode[]
  edges: MasteryTreeEdge[]
  extent: number
  totalPoints: number
  coreRadius: number
  arms: number
  guides: string[]
}
