import type { MasteryMap, MasteryValue } from './explorer-types'

export const SHARE_QUERY_KEY = 'tree'
export const MAX_SHARE_CHAMPIONS = 25
export const MAX_MASTERY_POINTS = 999_999_999

type ShareTuple = [number, number | null, number | null]

type SharePayload = {
  v: 1
  c: ShareTuple[]
}

export type DecodedShareState =
  | { ok: true; masteries: MasteryMap; count: number }
  | { ok: false; reason: 'invalid' | 'empty' }

function toBase64Url(value: string): string {
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  return atob(padded + padding)
}

function normalizePoints(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const rounded = Math.round(value)
  if (rounded < 0 || rounded > MAX_MASTERY_POINTS) return null
  return rounded
}

function normalizeLevel(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const rounded = Math.round(value)
  if (rounded < 0 || rounded > 10) return null
  return rounded
}

export function sortedMasteryEntries(masteries: MasteryMap) {
  return Object.entries(masteries)
    .map(([id, value]) => ({
      championId: Number(id),
      points: normalizePoints(value.points),
      level: normalizeLevel(value.level),
    }))
    .filter((entry) => Number.isInteger(entry.championId) && entry.championId > 0)
    .sort((a, b) => {
      if (a.points === null && b.points === null) {
        return a.championId - b.championId
      }
      if (a.points === null) return 1
      if (b.points === null) return -1
      if (a.points !== b.points) return b.points - a.points
      return (b.level ?? -1) - (a.level ?? -1)
    })
}

export function encodeShareState(masteries: MasteryMap): string {
  const entries = sortedMasteryEntries(masteries).slice(0, MAX_SHARE_CHAMPIONS)
  const payload: SharePayload = {
    v: 1,
    c: entries.map((entry) => [entry.championId, entry.points, entry.level]),
  }

  return toBase64Url(JSON.stringify(payload))
}

export function decodeShareState(raw: string | null | undefined): DecodedShareState {
  if (!raw || raw.length > 2400) return { ok: false, reason: 'invalid' }

  try {
    const parsed: unknown = JSON.parse(fromBase64Url(raw))
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, reason: 'invalid' }
    }

    const payload = parsed as Record<string, unknown>
    if (payload.v !== 1 || !Array.isArray(payload.c)) {
      return { ok: false, reason: 'invalid' }
    }

    if (payload.c.length === 0 || payload.c.length > MAX_SHARE_CHAMPIONS) {
      return { ok: false, reason: 'invalid' }
    }

    const masteries: MasteryMap = {}

    for (const item of payload.c) {
      if (!Array.isArray(item) || item.length !== 3) {
        return { ok: false, reason: 'invalid' }
      }

      const [rawId, rawPoints, rawLevel] = item
      const championId = typeof rawId === 'number' ? Math.round(rawId) : NaN
      if (!Number.isInteger(championId) || championId <= 0 || championId > 99999) {
        return { ok: false, reason: 'invalid' }
      }

      const value: MasteryValue = {
        points: normalizePoints(rawPoints),
        level: normalizeLevel(rawLevel),
      }

      masteries[championId] = value
    }

    const count = Object.keys(masteries).length
    return count > 0
      ? { ok: true, masteries, count }
      : { ok: false, reason: 'empty' }
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}
