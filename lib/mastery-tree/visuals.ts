import type { ExplorerRole } from './explorer-types'

export const ROLE_COLORS: Record<ExplorerRole, { color: string; soft: string }> = {
  top: { color: '#f0a35e', soft: 'rgba(240, 163, 94, 0.22)' },
  jungle: { color: '#5ee0a0', soft: 'rgba(94, 224, 160, 0.22)' },
  mid: { color: '#b18cff', soft: 'rgba(177, 140, 255, 0.24)' },
  adc: { color: '#f472b6', soft: 'rgba(244, 114, 182, 0.22)' },
  support: { color: '#4fd1ef', soft: 'rgba(79, 209, 239, 0.22)' },
}

export const LEVEL_STYLES: Record<number, { color: string; soft: string }> = {
  1: { color: '#b6a58a', soft: 'rgba(182, 165, 138, 0.18)' },
  2: { color: '#c69a63', soft: 'rgba(198, 154, 99, 0.18)' },
  3: { color: '#d8a65a', soft: 'rgba(216, 166, 90, 0.2)' },
  4: { color: '#9fb0c8', soft: 'rgba(159, 176, 200, 0.18)' },
  5: { color: '#38bdf8', soft: 'rgba(56, 189, 248, 0.2)' },
  6: { color: '#c084fc', soft: 'rgba(192, 132, 252, 0.22)' },
  7: { color: '#f0c75e', soft: 'rgba(240, 199, 94, 0.24)' },
  8: { color: '#f2d98a', soft: 'rgba(242, 217, 138, 0.26)' },
  9: { color: '#ffe8a3', soft: 'rgba(255, 232, 163, 0.3)' },
  10: { color: '#fff4cf', soft: 'rgba(255, 244, 207, 0.34)' },
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function getLevelStyle(level: number | null) {
  if (level === null) return LEVEL_STYLES[1]
  return LEVEL_STYLES[clamp(Math.round(level), 1, 10)] ?? LEVEL_STYLES[1]
}

export const ROLE_GLYPHS: Record<ExplorerRole, string> = {
  top: 'M12 2 L16 8 L13.5 9.6 L13.5 17.5 L18 19.8 L18 21.8 L12 19.6 L6 21.8 L6 19.8 L10.5 17.5 L10.5 9.6 L8 8 Z',
  jungle: 'M20.5 3.5 C11.5 3.5 4 9.5 4 18.5 C13 18.5 20.5 12 20.5 3.5 Z M4 20.5 L15.5 9',
  mid: 'M12 2 L21.5 12 L12 22 L2.5 12 Z M12 6.2 L17.3 12 L12 17.8 L6.7 12 Z',
  adc: 'M4 20 L15 9 M5.5 4.5 C15.5 5.5 19.5 9.5 20 19.5 M20 19.5 L16.6 18.6 M20 19.5 L19.1 16.1 M4.5 5.5 L17 18',
  support: 'M12 2.5 L20 6.2 L20 12.1 C20 17.2 16.4 20.7 12 22 C7.6 20.7 4 17.2 4 12.1 L4 6.2 Z M12 7.2 L12 15.8 M7.8 11.5 L16.2 11.5',
}

export const ROLE_ORDER: ExplorerRole[] = ['top', 'jungle', 'mid', 'adc', 'support']
