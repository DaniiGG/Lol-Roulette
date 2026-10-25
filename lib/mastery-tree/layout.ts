import type {
  ChampionMetaMap,
  MasteryEntry,
  MasteryTreeEdge,
  MasteryTreeLayout,
  MasteryTreeNode,
} from './types'

const GAP = 24
const MIN_RADIUS = 11
const SUN_RADIUS = 150
const MAX_ORBIT_RADIUS = 104
const SIZE_CURVE = 1.4
const ANGLE_PER_UNIT = 0.0032
const TAU = Math.PI * 2

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function randomFrom(seed: string): number {
  let state = hashString(seed)
  state += 0x6d2b79f5
  state = Math.imul(state ^ (state >>> 15), state | 1)
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61)
  return ((state ^ (state >>> 14)) >>> 0) / 4294967296
}

function edgeColor(level: number): string {
  if (level >= 7) return 'rgba(240, 199, 94, 0.5)'
  if (level >= 6) return 'rgba(192, 132, 252, 0.4)'
  if (level >= 5) return 'rgba(56, 189, 248, 0.34)'
  return 'rgba(139, 124, 246, 0.26)'
}

function buildCurve(source: MasteryTreeNode, target: MasteryTreeNode, seed: string): string {
  const dx = target.x - source.x
  const dy = target.y - source.y
  const length = Math.hypot(dx, dy) || 1
  const normalX = -dy / length
  const normalY = dx / length
  const bend = (randomFrom(seed) - 0.5) * Math.min(length * 0.16, 42)

  const c1x = source.x + dx * 0.36 + normalX * bend
  const c1y = source.y + dy * 0.36 + normalY * bend
  const c2x = source.x + dx * 0.7 - normalX * bend * 0.4
  const c2y = source.y + dy * 0.7 - normalY * bend * 0.4

  return `M ${source.x.toFixed(2)} ${source.y.toFixed(2)} C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${target.x.toFixed(2)} ${target.y.toFixed(2)}`
}

function buildGuide(armBase: number, startRadius: number, endRadius: number): string {
  const steps = 96
  const points: string[] = []

  for (let step = 0; step <= steps; step++) {
    const radius = startRadius + ((endRadius - startRadius) * step) / steps
    const angle = armBase + radius * ANGLE_PER_UNIT
    points.push(`${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`)
  }

  return `M ${points.join(' L ')}`
}

export function buildMasteryTreeLayout(
  masteries: MasteryEntry[],
  championMeta: ChampionMetaMap,
  seed: string,
): MasteryTreeLayout {
  const sorted = [...masteries]
    .filter((entry) => entry.championPoints > 0)
    .sort((a, b) => b.championPoints - a.championPoints || a.championId - b.championId)

  if (!sorted.length) {
    return {
      nodes: [],
      edges: [],
      extent: 160,
      totalPoints: 0,
      coreRadius: 0,
      arms: 0,
      guides: [],
    }
  }

  const totalPoints = sorted.reduce((sum, entry) => sum + entry.championPoints, 0)
  const maxPoints = sorted[0].championPoints
  const arms = sorted.length <= 8 ? 3 : sorted.length <= 26 ? 4 : 5
  const armOffset = randomFrom(`${seed}:galaxy`) * TAU
  const armAngles = Array.from(
    { length: arms },
    (_, arm) => armOffset + (arm * TAU) / arms,
  )

  const nodes: MasteryTreeNode[] = sorted.map((entry, rank) => {
    const meta = championMeta[entry.championId]
    const ratio = clamp(entry.championPoints / maxPoints, 0, 1)
    const radius =
      rank === 0
        ? SUN_RADIUS
        : clamp(
            MIN_RADIUS + Math.pow(ratio, SIZE_CURVE) * (MAX_ORBIT_RADIUS - MIN_RADIUS),
            MIN_RADIUS,
            MAX_ORBIT_RADIUS,
          )

    return {
      id: entry.championId,
      championId: entry.championId,
      championKey: meta?.key ?? `champion_${entry.championId}`,
      name: meta?.name ?? `Champion ${entry.championId}`,
      title: meta?.title ?? '',
      tags: meta?.tags ?? [],
      level: entry.championLevel,
      points: entry.championPoints,
      share: totalPoints > 0 ? (entry.championPoints / totalPoints) * 100 : 0,
      radius,
      x: 0,
      y: 0,
      layer: 0,
      rank,
      parentId: null,
      tier: rank === 0 ? 'legend' : 'outer',
      delay: 0,
      arm: rank === 0 ? -1 : (rank - 1) % arms,
    }
  })

  const armEdge = Array.from({ length: arms }, () => SUN_RADIUS + GAP)
  const armDepth = Array.from({ length: arms }, () => 0)
  const armLast = Array.from({ length: arms }, () => nodes[0].id)
  const initialPositions: Array<{ x: number; y: number }> = nodes.map(() => ({
    x: 0,
    y: 0,
  }))

  for (let rank = 1; rank < nodes.length; rank++) {
    const node = nodes[rank]
    const arm = node.arm
    const distance = armEdge[arm] + node.radius
    const angle = armAngles[arm] + distance * ANGLE_PER_UNIT

    node.x = Math.cos(angle) * distance
    node.y = Math.sin(angle) * distance
    node.parentId = armLast[arm]
    node.layer = armDepth[arm] + 1
    node.tier = node.layer === 1 ? 'core' : node.layer <= 3 ? 'branch' : 'outer'
    node.delay = Math.min(1.8, 0.12 + node.layer * 0.06 + rank * 0.004)

    initialPositions[rank] = { x: node.x, y: node.y }
    armEdge[arm] = distance + node.radius + GAP
    armDepth[arm] += 1
    armLast[arm] = node.id
  }

  const displacement = nodes.map(() => ({ x: 0, y: 0 }))
  const iterations = 56

  for (let iteration = 0; iteration < iterations; iteration++) {
    for (const item of displacement) {
      item.x = 0
      item.y = 0
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distance = Math.hypot(dx, dy)
        const minDistance = a.radius + b.radius + GAP

        if (distance >= minDistance) continue

        const nx = distance > 0.0001 ? dx / distance : Math.cos((i + 1) * 1.618 + j)
        const ny = distance > 0.0001 ? dy / distance : Math.sin((i + 1) * 1.618 + j)
        const push = (minDistance - distance) * 0.5

        if (i === 0) {
          displacement[j].x += nx * push * 2
          displacement[j].y += ny * push * 2
        } else {
          displacement[i].x += nx * push
          displacement[i].y += ny * push
          displacement[j].x -= nx * push
          displacement[j].y -= ny * push
        }
      }
    }

    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i]
      const initial = initialPositions[i]
      displacement[i].x += (initial.x - node.x) * 0.06
      displacement[i].y += (initial.y - node.y) * 0.06
      node.x += displacement[i].x * 0.65
      node.y += displacement[i].y * 0.65
    }
  }

  const edges: MasteryTreeEdge[] = []
  const byId = new Map(nodes.map((node) => [node.id, node]))

  for (const node of nodes) {
    if (node.parentId === null) continue
    const parent = byId.get(node.parentId)
    if (!parent) continue

    edges.push({
      id: `${parent.id}-${node.id}`,
      sourceId: parent.id,
      targetId: node.id,
      path: buildCurve(parent, node, `${seed}:edge:${parent.id}:${node.id}`),
      layer: node.layer,
      color: edgeColor(node.level),
      width: node.layer <= 1 ? 2.2 : node.layer === 2 ? 1.6 : 1.05,
      delay: Math.min(1.3, 0.08 + node.layer * 0.08),
    })
  }

  const maxDistance = nodes.reduce((distance, node) => {
    return Math.max(distance, Math.hypot(node.x, node.y) + node.radius)
  }, 0)

  const guideEnd = maxDistance + 40
  const guides = armAngles.map((angle) =>
    buildGuide(angle, SUN_RADIUS * 0.72, Math.max(guideEnd, SUN_RADIUS * 1.6)),
  )

  return {
    nodes,
    edges,
    extent: Math.ceil(Math.max(220, maxDistance + 110)),
    totalPoints,
    coreRadius: SUN_RADIUS * 1.55,
    arms,
    guides,
  }
}
