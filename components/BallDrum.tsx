'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { championIconUrl } from '@/lib/champion-data'
import { playRouletteSound } from '@/lib/roulette-sound'
import type { RouletteWheelProps } from './RouletteWheel'
import styles from './BallDrum.module.css'

type Champion = Parameters<RouletteWheelProps['onResult']>[0]
type Ball = { x: number; y: number; vx: number; vy: number }

export const BALL_DRAW_MS = 3250
const STAGE_SIZE = 350
const CENTER_Y = 145
const BALL_RADIUS = 11
const WALL_RADIUS = 112
const MIX_MS = 2050
const GUIDE_MS = 470
const EXIT_Y = 113
const TRAY_Y = 169
const FALL_MS = 330
const STEP = 1 / 120
const BALL_DIAMETER = BALL_RADIUS * 2
const REST_POSITIONS = Array.from({ length: 6 }, (_, row) => {
  const y = 109 - row * BALL_RADIUS * Math.sqrt(3)
  const limit = Math.sqrt(WALL_RADIUS ** 2 - y ** 2)
  const offset = row % 2 ? BALL_RADIUS : 0
  const first = Math.ceil((-limit - offset) / BALL_DIAMETER)
  const last = Math.floor((limit - offset) / BALL_DIAMETER)
  return Array.from({ length: last - first + 1 }, (_, column) => [(first + column) * BALL_DIAMETER + offset, y])
}).flat()

function advance(balls: Ball[], elapsed: number) {
  let impact = 0
  const power = Math.max(0, 1 - Math.max(0, elapsed - MIX_MS) / 650)
  for (const ball of balls) {
    ball.vx *= .997
    ball.vy = (ball.vy + 480 * STEP) * .997
    ball.x += ball.vx * STEP
    ball.y += ball.vy * STEP
  }

  for (let i = 0; i < balls.length; i++) {
    const a = balls[i]
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const squaredDistance = dx * dx + dy * dy
      if (squaredDistance >= BALL_DIAMETER ** 2) continue
      const distance = Math.sqrt(squaredDistance)
      const nx = distance ? dx / distance : 1
      const ny = distance ? dy / distance : 0
      const overlap = (BALL_DIAMETER - distance) / 2
      a.x -= overlap * nx
      a.y -= overlap * ny
      b.x += overlap * nx
      b.y += overlap * ny
      const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
      if (approach < 0) {
        impact = Math.max(impact, -approach)
        const impulse = approach * .87
        a.vx += impulse * nx
        a.vy += impulse * ny
        b.vx -= impulse * nx
        b.vy -= impulse * ny
      }
    }
  }

  for (const ball of balls) {
    const distance = Math.hypot(ball.x, ball.y)
    if (distance <= WALL_RADIUS) continue
    const nx = ball.x / distance
    const ny = ball.y / distance
    ball.x = nx * WALL_RADIUS
    ball.y = ny * WALL_RADIUS
    const outward = ball.vx * nx + ball.vy * ny
    if (outward > 0) {
      impact = Math.max(impact, outward)
      ball.vx -= outward * 1.76 * nx
      ball.vy -= outward * 1.76 * ny
    }
    // Friction against the rotating cage carries balls up its wall.
    const tangentSpeed = -ball.vx * ny + ball.vy * nx
    const friction = (310 * power - tangentSpeed) * .19
    ball.vx -= friction * ny
    ball.vy += friction * nx
  }
  return impact
}

function exitPosition(start: Ball, elapsed: number) {
  const exitTime = elapsed - MIX_MS
  if (exitTime < GUIDE_MS) {
    const t = exitTime / GUIDE_MS
    const eased = t * t * (3 - 2 * t)
    return { x: start.x * (1 - eased), y: start.y + (EXIT_Y - start.y) * eased, scale: 1 }
  }

  const fall = Math.min(1, (exitTime - GUIDE_MS) / FALL_MS)
  const bounce = Math.min(1, Math.max(0, (exitTime - GUIDE_MS - FALL_MS) / 210))
  return {
    x: 0,
    y: EXIT_Y + (TRAY_Y - EXIT_Y) * fall ** 2 - Math.sin(bounce * Math.PI) * 8,
    scale: 1 + 1.4 * fall,
  }
}

export default function BallDrum({ champions, winner }: { champions: Champion[]; winner?: Champion }) {
  const stage = useRef<HTMLDivElement>(null)
  const discs = useRef<(HTMLSpanElement | null)[]>([])
  const portraits = REST_POSITIONS.map((_, index) => champions[
    champions.length < REST_POSITIONS.length
      ? index % champions.length
      : Math.floor(index * champions.length / REST_POSITIONS.length)
  ])
  const winnerIndex = winner ? Math.max(0, portraits.findIndex(champion => champion?.id === winner.id)) : -1
  if (winner) portraits[winnerIndex] = winner

  useLayoutEffect(() => {
    const drum = stage.current
    if (!drum || !winner) return
    const disc = discs.current[winnerIndex]
    if (!disc) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drum.dataset.gate = 'open'
      disc.dataset.extracted = 'true'
      disc.style.left = '50%'
      disc.style.top = ((CENTER_Y + TRAY_Y) / STAGE_SIZE * 100) + '%'
      disc.style.transform = 'scale(2.4)'
      return
    }

    const balls = REST_POSITIONS.map(([x, y]) => ({
      x, y, vx: (Math.random() - .5) * 400, vy: -210 - Math.random() * 185,
    }))
    let circulating = balls
    let simulated = 0
    let start: number | undefined
    let exitStart: Ball | undefined
    let lastTap = -Infinity
    let landed = false
    let frame: number

    const animate = (now: number) => {
      start ??= now
      const elapsed = now - start
      // Cap catch-up after a suspended frame while keeping collision steps small.
      const end = Math.min(elapsed, simulated + 50)
      let impact = 0
      while (simulated + STEP * 1000 <= end) {
        simulated += STEP * 1000
        impact = Math.max(impact, advance(circulating, simulated))
      }
      if (impact > 68 && elapsed < MIX_MS + 300 && elapsed - lastTap >= 66) {
        playRouletteSound('ballTap', Math.min(.85, impact / 295))
        lastTap = elapsed
      }
      if (!exitStart && elapsed >= MIX_MS) {
        playRouletteSound('latch')
        drum.dataset.gate = 'open'
        exitStart = { ...balls[winnerIndex] }
        circulating = balls.filter((_, index) => index !== winnerIndex)
      }
      if (exitStart && elapsed >= MIX_MS + GUIDE_MS) disc.dataset.extracted = 'true'
      if (!landed && elapsed >= MIX_MS + GUIDE_MS + FALL_MS) {
        playRouletteSound('drop')
        landed = true
      }

      balls.forEach((ball, index) => {
        const [x, y] = REST_POSITIONS[index]
        const position = index === winnerIndex && exitStart
          ? exitPosition(exitStart, elapsed)
          : { x: ball.x, y: ball.y, scale: 1 }
        const element = discs.current[index]
        if (element) {
          const xPercent = (position.x - x) / BALL_DIAMETER * 100
          const yPercent = (position.y - y) / BALL_DIAMETER * 100
          element.style.transform = `translate3d(${xPercent}%, ${yPercent}%, 0) scale(${position.scale})`
        }
      })

      if (elapsed < BALL_DRAW_MS - 70) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [winner, winnerIndex])

  return (
    <div className={styles.stage} aria-hidden="true">
      <div ref={stage} className={styles.machine} data-turning={winner ? 'true' : undefined}>
        <div className={styles.supports} />
        <div className={styles.chamber} />
        <div className={styles.chute} />
        <div className={styles.cradle} />
        <div className={styles.cage} />
        <div className={styles.axle} />
        <div className={styles.gate} />
        {REST_POSITIONS.map(([x, y], index) => {
          return (
            <span
              key={index}
              ref={element => { discs.current[index] = element }}
              className={styles.ball}
              style={{ left: (50 + x / STAGE_SIZE * 100) + '%', top: ((CENTER_Y + y) / STAGE_SIZE * 100) + '%', width: (BALL_DIAMETER / STAGE_SIZE * 100) + '%' }}
            >
              {portraits[index] && <Image src={championIconUrl(portraits[index].id)} alt="" width={48} height={48} unoptimized draggable={false} />}
            </span>
          )
        })}
      </div>
    </div>
  )
}
