import type {
  ChampionMetaMap,
  MasteryEntry,
  MasteryTreeEdge,
  MasteryTreeLayout,
  MasteryTreeNode,
} from './types'

const GAP = 16
const MIN_RADIUS = 19
const MAX_RADIUS = 76

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

function getRingRadius(
  layer: number[],
  nodes: MasteryTreeNode[],
  previousRadius: number,
  previousMaxNodeRadius: number,
  maxNodeRadius: number,
): number {
  const separationRadius =
    previousRadius + previousMaxNodeRadius + maxNodeRadius + GAP * 2 + 8

  if (layer.length < 2) return separationRadius

  const demands = layer.map((index, positionInLayer) => {
    const next = nodes[layer[(positionInLayer + 1) % layer.length]]
    return nodes[index].radius + next.radius + GAP + 12
  })

  let low = 0
  let high = Math.max(...demands) * layer.length

  for (let iteration = 0; iteration < 48; iteration++) {
    const mid = (low + high) / 2
    const totalAngle = demands.reduce(
      (sum, demand) => sum + 2 * Math.asin(Math.min(1, demand / (2 * mid))),
      0,
    )
    if (totalAngle <= Math.PI * 2) high = mid
    else low = mid
  }

  return Math.max(separationRadius, high * 1.06)
}

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index)
}

function getLayerCounts(total: number): number[][] {
  if (total <= 0) return []

  const layers: number[][] = [[0]]
  if (total === 1) return layers

  let coreCount = Math.min(7, total - 1)
  if (total - 1 - coreCount <= 3) coreCount = total - 1

  layers.push(range(1, 1 + coreCount))

  let cursor = 1 + coreCount
  let capacity = Math.max(10, Math.round(Math.max(coreCount, 1) * 1.7))

  while (cursor < total) {
    const count = Math.min(capacity, total - cursor)
    layers.push(range(cursor, cursor + count))
    cursor += count
    capacity = Math.max(8, Math.round(capacity * 1.35))
  }

  return layers
}

function edgeColor(level: number): string {
  if (level >= 7) return 'rgba(240, 199, 94, 0.42)'
  if (level >= 6) return 'rgba(192, 132, 252, 0.34)'
  if (level >= 5) return 'rgba(56, 189, 248, 0.29)'
  return 'rgba(139, 124, 246, 0.22)'
}

function buildCurve(source: MasteryTreeNode, target: MasteryTreeNode, seed: string): string {
  const dx = target.x - source.x
  const dy = target.y - source.y
  const length = Math.hypot(dx, dy) || 1
  const normalX = -dy / length
  const normalY = dx / length
  const bend = (randomFrom(seed) - 0.5) * Math.min(length * 0.34, 86)

  const c1x = source.x + dx * 0.34 + normalX * bend
  const c1y = source.y + dy * 0.34 + normalY * bend
  const c2x = source.x + dx * 0.68 - normalX * bend * 0.45
  const c2y = source.y + dy * 0.68 - normalY * bend * 0.45

  return `M ${source.x.toFixed(2)} ${source.y.toFixed(2)} C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${target.x.toFixed(2)} ${target.y.toFixed(2)}`
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
    return { nodes: [], edges: [], extent: 160, totalPoints: 0, coreRadius: 0 }
  }

  const totalPoints = sorted.reduce((sum, entry) => sum + entry.championPoints, 0)
  const logPoints = sorted.map((entry) => Math.log10(Math.max(1, entry.championPoints)))
  const minLog = Math.min(...logPoints)
  const maxLog = Math.max(...logPoints)
  const logSpan = Math.max(0.0001, maxLog - minLog)

  const nodes: MasteryTreeNode[] = sorted.map((entry, rank) => {
    const meta = championMeta[entry.championId]
    const normalized = clamp((logPoints[rank] - minLog) / logSpan, 0, 1)
    const radius = clamp(
      MIN_RADIUS + Math.pow(normalized, 0.92) * (MAX_RADIUS - MIN_RADIUS),
      MIN_RADIUS,
      MAX_RADIUS,
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
      tier: rank === 0 ? 'legend' : 'core',
      delay: 0,
    }
  })

  const layers = getLayerCounts(nodes.length)
  const initialPositions: Array<{ x: number; y: number }> = nodes.map(() => ({ x: 0, y: 0 }))
  let previousRadius = 0
  let previousMaxNodeRadius = 0
  let coreRadius = 0

  layers.forEach((layer, layerIndex) => {
    if (layerIndex === 0) {
      nodes[layer[0]].layer = 0
      nodes[layer[0]].x = 0
      nodes[layer[0]].y = 0
      initialPositions[layer[0]] = { x: 0, y: 0 }
      previousMaxNodeRadius = nodes[layer[0]].radius
      return
    }

    const maxNodeRadius = Math.max(...layer.map((index) => nodes[index].radius))
    const ringRadius = getRingRadius(
      layer,
      nodes,
      previousRadius,
      previousMaxNodeRadius,
      maxNodeRadius,
    )
    const radialJitter = Math.min(16, 4 + ringRadius * 0.02)
    const startAngle = randomFrom(`${seed}:layer:${layerIndex}`) * Math.PI * 2
    const angles =
      layer.length < 2
        ? [startAngle]
        : layer.map((index, positionInLayer) => {
            const next = nodes[layer[(positionInLayer + 1) % layer.length]]
            return 2 * Math.asin(
              Math.min(
                1,
                (nodes[index].radius + next.radius + GAP + 12) / (2 * ringRadius),
              ),
            )
          })
    const extraAngle =
      angles.length > 1
        ? Math.max(0, Math.PI * 2 - angles.reduce((sum, angle) => sum + angle, 0)) /
          angles.length
        : 0
    let cursor = startAngle

    if (layerIndex === 1) coreRadius = ringRadius

    layer.forEach((index, positionInLayer) => {
      const node = nodes[index]
      const angle = cursor
      const angleJitter =
        (randomFrom(`${seed}:${node.id}:angle`) - 0.5) *
        Math.min(0.1, extraAngle * 0.72 + 0.01)
      const distance =
        ringRadius +
        (randomFrom(`${seed}:${node.id}:radius`) - 0.5) * radialJitter * 2
      const finalX = Math.cos(angle + angleJitter) * distance
      const finalY = Math.sin(angle + angleJitter) * distance

      node.x = finalX
      node.y = finalY
      node.layer = layerIndex
      node.delay = Math.min(
        1.8,
        0.18 + layerIndex * 0.14 + (positionInLayer / Math.max(1, layer.length)) * 0.36,
      )
      initialPositions[index] = { x: finalX, y: finalY }
      cursor += (angles[positionInLayer] ?? 0) + extraAngle
    })

    previousRadius = ringRadius
    previousMaxNodeRadius = maxNodeRadius
  })

  for (let layerIndex = 1; layerIndex < layers.length; layerIndex++) {
    const previousLayer = layers[layerIndex - 1]
    for (const index of layers[layerIndex]) {
      const node = nodes[index]
      let bestId: number | null = null
      let bestDistance = Number.POSITIVE_INFINITY

      for (const previousIndex of previousLayer) {
        const parent = nodes[previousIndex]
        const distance = Math.hypot(node.x - parent.x, node.y - parent.y)
        if (distance < bestDistance) {
          bestDistance = distance
          bestId = parent.id
        }
      }

      node.parentId = bestId
    }
  }

  const displacement = nodes.map(() => ({ x: 0, y: 0 }))
  const iterations = 84

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
      displacement[i].x += (initial.x - node.x) * 0.028
      displacement[i].y += (initial.y - node.y) * 0.028
      node.x += displacement[i].x * 0.72
      node.y += displacement[i].y * 0.72
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
      width: node.layer <= 1 ? 2.1 : node.layer === 2 ? 1.55 : 1.05,
      delay: Math.min(1.3, 0.08 + node.layer * 0.11),
    })
  }

  for (const node of nodes) {
    if (node.parentId === null) {
      node.tier = 'legend'
    } else if (node.layer === 1) {
      node.tier = 'core'
    } else if (node.layer <= 3) {
      node.tier = 'branch'
    } else {
      node.tier = 'outer'
    }
  }

  const maxExtent = nodes.reduce((extent, node) => {
    return Math.max(extent, Math.abs(node.x) + node.radius, Math.abs(node.y) + node.radius)
  }, 0)

  return {
    nodes,
    edges,
    extent: Math.ceil(Math.max(180, maxExtent + 92)),
    totalPoints,
    coreRadius,
  }
}
