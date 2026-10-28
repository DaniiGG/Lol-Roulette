import {
  EMPTY_LAYOUT,
  EXPLORER_ROLES,
  type ChampionCatalogEntry,
  type ExplorerEdge,
  type ExplorerLayout,
  type ExplorerMode,
  type ExplorerNode,
  type ExplorerRole,
  type ExplorerRoleHub,
  type MasteryMap,
} from './explorer-types'
import { ROLE_COLORS, clamp } from './visuals'

const TAU = Math.PI * 2
const ROLE_SPAN = (TAU / EXPLORER_ROLES.length) * 0.84
const ROLE_ANGLES: Record<ExplorerRole, number> = {
  top: -Math.PI / 2,
  jungle: -Math.PI / 2 + ROLE_SPAN + 0.16,
  mid: -Math.PI / 2 + (ROLE_SPAN + 0.16) * 2,
  adc: -Math.PI / 2 + (ROLE_SPAN + 0.16) * 3,
  support: -Math.PI / 2 + (ROLE_SPAN + 0.16) * 4,
}

const HUB_ORBIT = 218
const HUB_RADIUS = 31
const RING_START = 366
const RING_GAP = 152
const CENTER_RADIUS = 62
const MIN_NODE_RADIUS = 16
const MAX_NODE_RADIUS = 42

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function randomFrom(seed: string): number {
  const value = hashString(seed)
  return (value % 100000) / 100000
}

function pointAt(angle: number, radius: number) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

function trimSegment(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.hypot(dx, dy) || 1
  const ux = dx / distance
  const uy = dy / distance
  return {
    x1: x1 + ux * (r1 + 3),
    y1: y1 + uy * (r1 + 3),
    x2: x2 - ux * (r2 + 3),
    y2: y2 - uy * (r2 + 3),
  }
}

function buildCurve(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: string,
  bendScale = 0.2,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  const nx = -dy / length
  const ny = dx / length
  const bend =
    (randomFrom(seed) - 0.5) * Math.min(length * bendScale, 64)
  const c1x = x1 + dx * 0.38 + nx * bend
  const c1y = y1 + dy * 0.38 + ny * bend
  const c2x = x1 + dx * 0.74 + nx * bend * 0.2
  const c2y = y1 + dy * 0.74 + ny * bend * 0.2

  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

function compareMastery(
  a: ChampionCatalogEntry,
  b: ChampionCatalogEntry,
  masteries: MasteryMap,
) {
  const aValue = masteries[a.championId]
  const bValue = masteries[b.championId]
  const aPoints = aValue?.points ?? -1
  const bPoints = bValue?.points ?? -1
  if (aPoints !== bPoints) return bPoints - aPoints

  const aLevel = aValue?.level ?? -1
  const bLevel = bValue?.level ?? -1
  if (aLevel !== bLevel) return bLevel - aLevel

  return a.name.localeCompare(b.name, 'en')
}

function radiusFor(
  points: number | null,
  maxPoints: number,
  sizeByMastery: boolean,
  mode: ExplorerMode,
) {
  if (mode === 'explore') return 21
  if (!sizeByMastery || points === null || maxPoints <= 0) return 30

  const ratio = Math.sqrt(clamp(points / maxPoints, 0, 1))
  return MIN_NODE_RADIUS + ratio * (MAX_NODE_RADIUS - MIN_NODE_RADIUS)
}

export interface ExplorerLayoutOptions {
  mode: ExplorerMode
  masteries: MasteryMap
  sizeByMastery: boolean
}

export function buildExplorerLayout(
  catalog: ChampionCatalogEntry[],
  { mode, masteries, sizeByMastery }: ExplorerLayoutOptions,
): ExplorerLayout {
  const entries =
    mode === 'personal'
      ? catalog.filter((champion) => masteries[champion.championId] !== undefined)
      : catalog

  if (!entries.length) {
    return { ...EMPTY_LAYOUT, mode }
  }

  const totalPoints = entries.reduce((total, champion) => {
    const points = masteries[champion.championId]?.points
    return total + (points && Number.isFinite(points) ? points : 0)
  }, 0)
  const maxPoints = entries.reduce((max, champion) => {
    const points = masteries[champion.championId]?.points
    return points && Number.isFinite(points) ? Math.max(max, points) : max
  }, 0)

  const sortedForCenter =
    mode === 'personal'
      ? [...entries].sort((a, b) => compareMastery(a, b, masteries))
      : []
  const center = sortedForCenter[0] ?? null

  const roleCounts: Record<ExplorerRole, number> = {
    top: 0,
    jungle: 0,
    mid: 0,
    adc: 0,
    support: 0,
  }

  for (const champion of entries) {
    roleCounts[champion.primaryRole] += 1
  }

  const nodes: ExplorerNode[] = []
  const hubs: ExplorerRoleHub[] = []
  const edges: ExplorerEdge[] = []
  const byRole = new Map<ExplorerRole, ChampionCatalogEntry[]>()

  for (const role of EXPLORER_ROLES) {
    byRole.set(role, [])
  }

  for (const champion of entries) {
    if (center && champion.championId === center.championId) continue
    byRole.get(champion.primaryRole)?.push(champion)
  }

  for (const role of EXPLORER_ROLES) {
    const roleEntries = byRole.get(role) ?? []
    roleEntries.sort((a, b) =>
      mode === 'personal'
        ? compareMastery(a, b, masteries)
        : a.name.localeCompare(b.name, 'en'),
    )

    if (!roleEntries.length) continue

    const angle = ROLE_ANGLES[role]
    const hubPosition = pointAt(angle, HUB_ORBIT)
    hubs.push({
      role,
      x: hubPosition.x,
      y: hubPosition.y,
      radius: HUB_RADIUS,
      angle,
      count: roleEntries.length,
    })

    const spacing = mode === 'personal' ? 86 : 56
    let remaining = [...roleEntries]
    let ring = 0

    while (remaining.length) {
      const ringRadius = RING_START + ring * RING_GAP
      const capacity = Math.max(
        1,
        Math.floor((ROLE_SPAN * ringRadius) / spacing),
      )
      const count = Math.min(capacity, remaining.length)
      const chunk = remaining.slice(0, count)
      remaining = remaining.slice(count)

      const usedSpan =
        count <= 1
          ? 0
          : Math.min(ROLE_SPAN, ((count - 1) * spacing) / ringRadius)

      chunk.forEach((champion, index) => {
        const offset =
          count <= 1 ? 0 : index / (count - 1) - 0.5
        const jitter =
          (randomFrom(`${champion.key}:${role}:${ring}`) - 0.5) * 0.018
        const nodeAngle = angle + offset * usedSpan + jitter
        const position = pointAt(nodeAngle, ringRadius)
        const value = masteries[champion.championId]

        nodes.push({
          id: champion.championId,
          championId: champion.championId,
          key: champion.key,
          name: champion.name,
          title: champion.title,
          tags: champion.tags,
          roles: champion.roles,
          primaryRole: champion.primaryRole,
          points: value?.points ?? null,
          level: value?.level ?? null,
          share:
            value?.points && totalPoints > 0
              ? (value.points / totalPoints) * 100
              : 0,
          radius: radiusFor(
            value?.points ?? null,
            maxPoints,
            sizeByMastery,
            mode,
          ),
          x: position.x,
          y: position.y,
          rank: 0,
          roleRank: index,
          delay: Math.min(1.4, 0.1 + ring * 0.08 + index * 0.012),
          isCenter: false,
        })
      })

      ring += 1
    }
  }

  const centerRadius = center ? CENTER_RADIUS : HUB_RADIUS * 1.35
  const centerNode: ExplorerNode | null = center
    ? {
        id: center.championId,
        championId: center.championId,
        key: center.key,
        name: center.name,
        title: center.title,
        tags: center.tags,
        roles: center.roles,
        primaryRole: center.primaryRole,
        points: masteries[center.championId]?.points ?? null,
        level: masteries[center.championId]?.level ?? null,
        share:
          masteries[center.championId]?.points && totalPoints > 0
            ? ((masteries[center.championId]?.points ?? 0) / totalPoints) * 100
            : 0,
        radius: centerRadius,
        x: 0,
        y: 0,
        rank: 0,
        roleRank: 0,
        delay: 0.02,
        isCenter: true,
      }
    : null

  if (centerNode) nodes.unshift(centerNode)

  const ranked = [...nodes]
    .filter((node) => !node.isCenter)
    .sort((a, b) => {
      if (a.points === null && b.points === null) {
        return a.name.localeCompare(b.name, 'en')
      }
      if (a.points === null) return 1
      if (b.points === null) return -1
      return b.points - a.points
    })

  ranked.forEach((node, index) => {
    node.rank = index + 1
  })

  for (const hub of hubs) {
    const trunkStart = pointAt(hub.angle, centerRadius)
    const trunkEnd = pointAt(hub.angle, HUB_ORBIT - HUB_RADIUS)
    const trim = trimSegment(
      trunkStart.x,
      trunkStart.y,
      2,
      trunkEnd.x,
      trunkEnd.y,
      2,
    )
    edges.push({
      id: `trunk-${hub.role}`,
      path: buildCurve(
        trim.x1,
        trim.y1,
        trim.x2,
        trim.y2,
        `trunk:${hub.role}`,
        0.08,
      ),
      color: 'rgba(240, 199, 94, 0.62)',
      width: 3.1,
      delay: 0.06,
      kind: 'trunk',
      role: hub.role,
      targetId: null,
    })
  }

  const nodesByRole = new Map<ExplorerRole, ExplorerNode[]>()
  for (const role of EXPLORER_ROLES) nodesByRole.set(role, [])
  for (const node of nodes) {
    if (node.isCenter) continue
    nodesByRole.get(node.primaryRole)?.push(node)
  }

  for (const hub of hubs) {
    const hubNodes = nodesByRole.get(hub.role) ?? []
    const hubPoint = pointAt(hub.angle, HUB_ORBIT)

    for (const node of hubNodes) {
      const trim = trimSegment(
        hubPoint.x,
        hubPoint.y,
        hub.radius,
        node.x,
        node.y,
        node.radius,
      )
      const color = ROLE_COLORS[hub.role].color

      edges.push({
        id: `branch-${node.championId}`,
        path: buildCurve(
          trim.x1,
          trim.y1,
          trim.x2,
          trim.y2,
          `branch:${hub.role}:${node.championId}`,
          0.22,
        ),
        color: `${color}59`,
        width: node.isCenter ? 2.2 : 1.15,
        delay: Math.min(1.2, 0.12 + node.roleRank * 0.02),
        kind: 'branch',
        role: hub.role,
        targetId: node.championId,
      })
    }
  }

  const maxDistance = nodes.reduce((distance, node) => {
    return Math.max(distance, Math.hypot(node.x, node.y) + node.radius)
  }, centerRadius)

  const extent = Math.ceil(
    Math.max(430, maxDistance + (mode === 'personal' ? 120 : 138)),
  )

  return {
    nodes,
    hubs,
    edges,
    extent,
    totalPoints,
    maxPoints,
    centerNodeId: centerNode?.championId ?? null,
    mode,
    roleCounts,
  }
}
