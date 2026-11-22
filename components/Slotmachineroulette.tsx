'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { LoaderCircle, RotateCcw } from 'lucide-react'
import { championIconUrl, loadChampionData } from '@/lib/champion-data'
import { getChampionsByLane, normalizeChampionName } from '@/lib/champion-lanes'
import { CHAMPION_CLASSES, CHAMPION_REGIONS } from '@/lib/champion-metadata'
import { playRouletteSound } from '@/lib/roulette-sound'
import RouletteLever from './RouletteLever'
import DrawRoulette, { type DrawVariant } from './DrawRoulette'
import type { RouletteWheelProps } from './RouletteWheel'
import styles from './RouletteAppearance.module.css'

type Champion = { id: string; key: number; name: string }
type Round = { winner: Champion; reels: Champion[][] }
const normalize = (name: string) => normalizeChampionName(name).toLowerCase()
const regions = new Map(Object.entries(CHAMPION_REGIONS).map(([name, values]) => [normalize(name), values]))
const classes = new Map(Object.entries(CHAMPION_CLASSES).map(([name, values]) => [normalize(name), values]))

function Machine({ champions, disabled, profileLoading, onResult, onSpinningChange }: RouletteWheelProps & { champions: Champion[] }) {
  const t = useTranslations('championCard')
  const slot = useTranslations('slotMachine')
  const [round, setRound] = useState<Round | null>(null)
  const [winner, setWinner] = useState<Champion | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [stopped, setStopped] = useState(0)
  const strips = useRef<(HTMLDivElement | null)[]>([])
  const lock = useRef(false)
  const callbacks = useRef({ onResult, onSpinningChange })
  useEffect(() => { callbacks.current = { onResult, onSpinningChange } }, [onResult, onSpinningChange])

  function spin() {
    if (lock.current) return
    if (disabled || profileLoading || !champions.length) {
      callbacks.current.onSpinningChange?.(false)
      return
    }
    lock.current = true
    setSpinning(true)
    setWinner(null)
    setStopped(0)
    callbacks.current.onSpinningChange?.(true)
    // Choose the result once; every reel lands on that exact champion.
    const winner = champions[Math.floor(Math.random() * champions.length)]
    const visuals = Array.from({ length: 12 }, () => champions[Math.floor(Math.random() * champions.length)])
    const reels = Array.from({ length: 3 }, (_, reel) => [
      ...Array.from({ length: 30 + reel * 8 }, () => visuals[Math.floor(Math.random() * visuals.length)]),
      winner,
      visuals[reel],
    ])
    setRound({ winner, reels })
  }

  useEffect(() => {
    if (!round) return
    let cancelled = false
    const animations: Animation[] = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const previousRows = round.reels.map(() => 0)
    let soundFrame = 0
    let lastTick = -Infinity
    const tickReels = (now: number) => {
      let rowChanged = false
      animations.forEach((animation, index) => {
        if (animation.playState !== 'running') return
        const progress = animation.effect?.getComputedTiming().progress ?? 0
        const row = Math.floor(progress * (round.reels[index].length - 3))
        if (row !== previousRows[index]) rowChanged = true
        previousRows[index] = row
      })
      if (rowChanged && now - lastTick >= 43) {
        playRouletteSound('reelTick')
        lastTick = now
      }
      if (animations.some(animation => animation.playState === 'running')) soundFrame = requestAnimationFrame(tickReels)
    }
    async function animate() {
      try {
        await Promise.all(round!.reels.map(async (reel, index) => {
          const strip = strips.current[index]
          if (!strip) throw new Error('Reel unavailable')
          // Percentages keep the winning row centered when the viewport changes.
          const target = -(reel.length - 3) / reel.length * 100
          const animation = strip.animate([
            { transform: 'translateY(0)' },
            { transform: 'translateY(' + target + '%)' },
          ], { duration: reduced ? 120 + index * 70 : 2400 + index * 440, easing: 'cubic-bezier(0.15, 0.72, 0.12, 1)', fill: 'forwards' })
          animations.push(animation)
          await animation.finished
          if (!cancelled) {
            if (!reduced) playRouletteSound('reelStop')
            setStopped(count => count + 1)
          }
        }))
        if (cancelled) return
        setWinner(round!.winner)
        // Keep the lever locked until result persistence has finished.
        await callbacks.current.onResult(round!.winner)
      } catch (error) {
        if (!cancelled) console.error('Slot animation interrupted', error)
      } finally {
        if (!cancelled) {
          lock.current = false
          setSpinning(false)
          callbacks.current.onSpinningChange?.(false)
        }
      }
    }
    void animate()
    if (!reduced) soundFrame = requestAnimationFrame(tickReels)
    return () => {
      cancelled = true
      cancelAnimationFrame(soundFrame)
      animations.forEach(animation => animation.cancel())
    }
  }, [round])

  useEffect(() => () => { callbacks.current.onSpinningChange?.(false) }, [])
  const reels = round?.reels ?? Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) => champions[(i + j) % champions.length]))
  return (
    <div className={styles.stage}>
      <RouletteLever onActivate={spin} onPullStart={() => callbacks.current.onSpinningChange?.(true)} disabled={spinning || !!disabled || !!profileLoading} isSpinning={spinning} />
      <div className={styles.cabinet} aria-busy={spinning}>
        <div className={styles.topline} aria-hidden="true"><i className={styles.light} /><i className={styles.light} /><i className={styles.light} /><span className={styles.rule} /></div>
        <div className={styles.reels} aria-hidden="true">
          {reels.map((reel, index) => (
            <div key={index} className={styles.window + (stopped > index ? ' ' + styles.stopped : '')}>
              <div key={round ? 'round' : 'idle'} ref={el => { strips.current[index] = el }} className={styles.strip}>
                {reel.map((champion, row) => <div key={row} className={styles.cell}>
                  <Image unoptimized src={championIconUrl(champion.id)} alt="" width={104} height={104} loading="eager" draggable={false} className={styles.portrait} />
                </div>)}
              </div>
              <div className={styles.shade} />
            </div>
          ))}
          <div className={styles.payline} />
        </div>
        <div className={styles.footer} role="status" aria-live="polite" aria-atomic="true">
          <span className={styles.caption}>{winner ? t('yourChampion') : spinning ? slot('spinning') : t('readyToBegin')}</span>
          {winner ? <span className="sr-only">{winner.name}</span> : <span className={styles.status}>{spinning ? '· · ·' : slot('pullLever')}</span>}
        </div>
      </div>
    </div>
  )
}

export default function SlotMachineRoulette({ variant = 'slots', ...props }: RouletteWheelProps & { variant?: 'slots' | DrawVariant }) {
  const locale = useLocale()
  const t = useTranslations('rouletteStyles')
  const slot = useTranslations('slotMachine')
  const [catalog, setCatalog] = useState<{ locale: string; champions: Champion[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    loadChampionData(locale).then(data => {
      if (!cancelled) setCatalog({ locale, champions: Object.entries(data).map(([key, champion]) => ({ id: champion.key, key: Number(key), name: champion.name })) })
    }).catch(() => { if (!cancelled) setError(locale) })
    return () => { cancelled = true }
  }, [locale, attempt])
  const poolKey = props.championPool?.map(normalize).join('\0') ?? null
  const lane = props.lane ?? 'all'
  const type = props.challengeFilter?.type
  const value = props.challengeFilter?.value
  const champions = useMemo(() => {
    if (catalog?.locale !== locale) return []
    const laneNames = lane === 'all' ? null : new Set(getChampionsByLane(lane).map(normalize))
    const poolNames = poolKey === null ? null : new Set(poolKey.split('\0'))
    return catalog.champions.filter(champion =>
      (!laneNames || laneNames.has(normalize(champion.name)) || laneNames.has(normalize(champion.id))) &&
      (!poolNames || poolNames.has(normalize(champion.name)) || poolNames.has(normalize(champion.id))) &&
      (type !== 'region' || regions.get(normalize(champion.id))?.includes(String(value))) &&
      (type !== 'class' || classes.get(normalize(champion.id))?.includes(String(value)))
    )
  }, [catalog, locale, lane, poolKey, type, value])
  const loading = catalog?.locale !== locale
  if (loading || error === locale || !champions.length) return (
    <div className={styles.stage}>
      {variant === 'slots' && <RouletteLever onActivate={() => {}} disabled isSpinning={false} />}
      <div className={styles.cabinet} style={{ minHeight: 290 }}>
        <div className={styles.overlay} role="status">
          {error === locale ? <><span className={styles.status}>{t('loadError')}</span><button type="button" className="flex min-h-11 items-center gap-2 rounded-lg border border-neutral-700 px-4 text-sm text-[#C89B3C]" onClick={() => { setError(null); setCatalog(null); setAttempt(x => x + 1) }}><RotateCcw size={14} />{t('retry')}</button></> : loading ? <><LoaderCircle className="animate-spin text-[#C89B3C]" size={24} /><span className={styles.status}>{slot('loading')}</span></> : <span className={styles.status}>{t('emptyPool')}</span>}
        </div>
      </div>
    </div>
  )
  const key = JSON.stringify([locale, lane, poolKey, type, value])
  return variant === 'slots'
    ? <Machine key={key} {...props} champions={champions} />
    : <DrawRoulette key={key} {...props} champions={champions} variant={variant} />
}
