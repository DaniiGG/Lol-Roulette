'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { championLoadingUrl } from '@/lib/champion-data'
import { cardSounds, playRouletteSound } from '@/lib/roulette-sound'
import type { RouletteWheelProps } from './RouletteWheel'
import BallDrum, { BALL_DRAW_MS } from './BallDrum'
import PuzzleRoulette, { PUZZLE_DRAW_MS } from './PuzzleRoulette'
import machine from './RouletteAppearance.module.css'
import styles from './DrawRoulette.module.css'

export type DrawVariant = 'balls' | 'cards' | 'puzzle'
type Champion = Parameters<RouletteWheelProps['onResult']>[0]
type Round = { id: number; champion: Champion }
type Props = RouletteWheelProps & { variant: DrawVariant; champions: Champion[] }
const drawDuration = { balls: BALL_DRAW_MS, cards: 3280, puzzle: PUZZLE_DRAW_MS }

function CardDeck({ champion }: { champion?: Champion }) {
  return (
    <div className={styles.cardStage} aria-hidden="true">
      <div className={styles.cardMat} />
      {(['left', 'right', 'center'] as const).map(position => (
        <div key={position} data-position={position} className={styles.card}>
          <div className={styles.cardTurn}>
            <div className={styles.cardBack}>
              <Image className={styles.cardCrest} src="/images/logo.png" alt="" width={80} height={80} loading="eager" unoptimized draggable={false} />
            </div>
            <div className={styles.cardFace}>
              {position === 'center' && champion
                ? <Image src={championLoadingUrl(champion.id)} alt="" width={120} height={190} loading="eager" unoptimized draggable={false} />
                : <span />}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DrawRoulette({ variant, champions, disabled, profileLoading, onResult, onSpinningChange }: Props) {
  const t = useTranslations('championCard')
  const slot = useTranslations('slotMachine')
  const [round, setRound] = useState<Round | null>(null)
  const [winner, setWinner] = useState<Champion | null>(null)
  const [spinning, setSpinning] = useState(false)
  const sequence = useRef(0)
  const pending = useRef<(() => void) | null>(null)

  useEffect(() => () => pending.current?.(), [])
  useEffect(() => {
    if (!round || variant !== 'cards' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timers = cardSounds.map(([seconds, cue]) =>
      window.setTimeout(() => playRouletteSound(cue), seconds * 1000)
    )
    return () => timers.forEach(timer => window.clearTimeout(timer))
  }, [round, variant])

  function spin() {
    if (pending.current || disabled || profileLoading || !champions.length) return
    const champion = champions[Math.floor(Math.random() * champions.length)]
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reducedMotion ? 0 : drawDuration[variant]
    const timeout = window.setTimeout(async () => {
      setWinner(champion)
      try {
        await onResult(champion)
      } catch (error) {
        console.error('Could not save roulette result', error)
      } finally {
        if (pending.current === cancel) {
          pending.current = null
          setSpinning(false)
          onSpinningChange?.(false)
        }
      }
    }, duration)
    function cancel() {
      window.clearTimeout(timeout)
      pending.current = null
      onSpinningChange?.(false)
    }

    pending.current = cancel
    sequence.current += 1
    setRound({ id: sequence.current, champion })
    setWinner(null)
    setSpinning(true)
    onSpinningChange?.(true)
  }

  return (
    <div className={machine.cabinet + ' ' + styles.cabinet}>
      <div key={round?.id ?? 0} className={round ? styles.running : undefined} aria-busy={spinning}>
        {variant === 'balls' && <BallDrum champions={champions} winner={round?.champion} />}
        {variant === 'cards' && <CardDeck champion={round?.champion} />}
        {variant === 'puzzle' && <PuzzleRoulette champion={round?.champion} />}
      </div>
      <div className={styles.controls}>
        <div className={styles.result} role="status" aria-atomic="true">
          <span className={machine.caption}>{winner ? t('yourChampion') : spinning ? slot('spinning') : t('readyToBegin')}</span>
          {winner && <strong>{winner.name}</strong>}
        </div>
        <button type="button" className={styles.spin} disabled={spinning || disabled || profileLoading} onClick={spin}>
          {winner ? t('spinAgain') : t('spinRoulette')}
        </button>
      </div>
    </div>
  )
}
