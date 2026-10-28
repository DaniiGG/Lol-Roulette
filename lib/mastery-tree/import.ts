import { MAX_MASTERY_POINTS } from './share-state'

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024
export const MAX_IMPORT_ENTRIES = 500

export type ImportedMasteryEntry = {
  championId: number
  points: number | null
  level: number | null
}

export type ImportErrorCode =
  | 'invalidJson'
  | 'shape'
  | 'noEntries'
  | 'tooLarge'
  | 'tooMany'
  | 'points'
  | 'level'

export type ImportResult =
  | { ok: true; entries: ImportedMasteryEntry[] }
  | { ok: false; code: ImportErrorCode }

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function getArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  for (const key of ['champions', 'masteries', 'data', 'entries']) {
    if (Array.isArray(record[key])) return record[key] as unknown[]
  }

  return null
}

function pickValue(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) return record[key]
  }
  return undefined
}

export function parseMasteryImport(
  text: string,
  byteLength = text.length,
): ImportResult {
  if (byteLength > MAX_IMPORT_BYTES) {
    return { ok: false, code: 'tooLarge' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, code: 'invalidJson' }
  }

  const source = getArray(parsed)
  if (!source) return { ok: false, code: 'shape' }
  if (source.length === 0) return { ok: false, code: 'noEntries' }
  if (source.length > MAX_IMPORT_ENTRIES) {
    return { ok: false, code: 'tooMany' }
  }

  const merged = new Map<number, ImportedMasteryEntry>()

  for (const item of source) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, code: 'shape' }
    }

    const record = item as Record<string, unknown>
    const rawId = readNumber(
      pickValue(record, ['championId', 'championID', 'champion_id', 'id']),
    )

    if (rawId === null || !Number.isInteger(rawId) || rawId <= 0) {
      return { ok: false, code: 'shape' }
    }

    const rawPoints = pickValue(record, [
      'championPoints',
      'points',
      'masteryPoints',
      'championPointsTotal',
    ])

    let points: number | null = null
    if (rawPoints !== undefined && rawPoints !== null) {
      const parsedPoints = readNumber(rawPoints)
      if (
        parsedPoints === null ||
        !Number.isInteger(parsedPoints) ||
        parsedPoints < 0 ||
        parsedPoints > MAX_MASTERY_POINTS
      ) {
        return { ok: false, code: 'points' }
      }
      points = parsedPoints
    }

    const rawLevel = pickValue(record, [
      'championLevel',
      'level',
      'masteryLevel',
    ])

    let level: number | null = null
    if (rawLevel !== undefined && rawLevel !== null) {
      const parsedLevel = readNumber(rawLevel)
      if (
        parsedLevel === null ||
        !Number.isInteger(parsedLevel) ||
        parsedLevel < 0 ||
        parsedLevel > 10
      ) {
        return { ok: false, code: 'level' }
      }
      level = parsedLevel
    }

    const existing = merged.get(rawId)
    if (!existing) {
      merged.set(rawId, { championId: rawId, points, level })
      continue
    }

    const existingPoints = existing.points ?? -1
    const nextPoints = points ?? -1
    if (nextPoints >= existingPoints) {
      merged.set(rawId, {
        championId: rawId,
        points: points ?? existing.points,
        level: level ?? existing.level,
      })
    }
  }

  const entries = Array.from(merged.values())
  return entries.length
    ? { ok: true, entries }
    : { ok: false, code: 'noEntries' }
}
