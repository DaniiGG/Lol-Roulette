import { useEffect, type CSSProperties } from 'react'
import Image from 'next/image'
import { championLoadingUrl } from '@/lib/champion-data'
import { playRouletteSound } from '@/lib/roulette-sound'
import styles from './PuzzleRoulette.module.css'

const PIECE_MS = 760
const DROP_ORDER = [6, 8, 7, 3, 5, 0, 2, 1, 4]
const dropDelay = (index: number) => 80 + DROP_ORDER.indexOf(index) * 205
const IMPACT_MS = Math.round(PIECE_MS * .72)
const ASSEMBLED_MS = dropDelay(4) + PIECE_MS
export const PUZZLE_DRAW_MS = ASSEMBLED_MS + 180

// The same tab profile is mirrored on adjacent edges so the picture fits together.
const tab = [[33, 0], [40, 2], [40, 7], [36, 13], [39, 18], [45, 21],
  [55, 21], [61, 18], [64, 13], [60, 7], [60, 2], [67, 0]]

const pieces = Array.from({ length: 9 }, (_, index) => {
  const column = index % 3
  const row = Math.floor(index / 3)
  const points = [
    [0, 0],
    ...(row > 0 ? tab.map(([x, depth]) => [x, depth]) : []),
    [100, 0],
    ...(column < 2 ? tab.map(([y, depth]) => [100 + depth, y]) : []),
    [100, 100],
    ...(row < 2 ? tab.map(([x, depth]) => [100 - x, 100 + depth]) : []),
    [0, 100],
    ...(column > 0 ? tab.map(([y, depth]) => [depth, 100 - y]) : []),
  ]
  return {
    index,
    column,
    row,
    clip: `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(', ')})`,
    delay: dropDelay(index),
  }
})

export default function PuzzleRoulette({ champion }: { champion?: { id: string } }) {
  useEffect(() => {
    if (!champion || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timers = pieces.map(({ delay }) => window.setTimeout(() => {
      playRouletteSound('pieceSnap')
    }, delay + IMPACT_MS))
    return () => timers.forEach(timer => window.clearTimeout(timer))
  }, [champion])

  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.board} data-assembled={champion ? 'true' : undefined} style={{ '--assembled': ASSEMBLED_MS + 'ms' } as CSSProperties}>
        {pieces.map(({ index, column, row }) => (
          <div key={index} className={styles.socket} style={{ left: column * 100 / 3 + '%', top: row * 100 / 3 + '%' }} />
        ))}
        {!champion && <Image className={styles.crest} src="/images/logo.png" alt="" width={78} height={78} unoptimized draggable={false} />}
        {champion && pieces.map(({ index, column, row, clip, delay }) => (
          <div key={index} className={styles.piece} style={{
            left: column * 100 / 3 + '%',
            top: row * 100 / 3 + '%',
            '--delay': delay + 'ms',
            '--duration': PIECE_MS + 'ms',
            '--drift': (column === 1 ? (row - 1) * 16 : (column - 1) * 39) + 'px',
            '--tilt': (index % 2 === 0 ? 1 : -1) * (16 + index * 2) + 'deg',
          } as CSSProperties}>
            <div className={styles.art} style={{ clipPath: clip }}>
              <Image src={championLoadingUrl(champion.id)} alt="" width={300} height={300} loading="eager" unoptimized draggable={false}
                style={{ left: -column * 100 + '%', top: -row * 100 + '%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
