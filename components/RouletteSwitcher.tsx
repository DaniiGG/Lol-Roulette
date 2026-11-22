'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight, Check, CircleDot, Dices, GalleryVerticalEnd, Layers, Puzzle, SlidersHorizontal } from 'lucide-react'
import { playRouletteSound, unlockRouletteAudio } from '@/lib/roulette-sound'
import RouletteWheel, { type RouletteWheelProps } from './RouletteWheel'
import SlotMachineRoulette from './Slotmachineroulette'
import machineStyles from './RouletteAppearance.module.css'
import revealStyles from './RouletteReveal.module.css'

const STORAGE_KEY = 'league-roulette-style'
const CHANGE_EVENT = 'league-roulette-style-change'
const styleIcons = { classic: CircleDot, slots: GalleryVerticalEnd, balls: Dices, cards: Layers, puzzle: Puzzle }
type RouletteStyle = keyof typeof styleIcons
const defaultStyle: RouletteStyle = 'classic'
let memoryStyle: RouletteStyle = defaultStyle
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}
function getStyle() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && Object.hasOwn(styleIcons, stored) ? stored as RouletteStyle : memoryStyle
  } catch { return memoryStyle }
}

function saveStyle(next: RouletteStyle) {
  memoryStyle = next
  try { localStorage.setItem(STORAGE_KEY, next) } catch { /* Preserve the selection for this visit. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export default function RouletteSwitcher(props: RouletteWheelProps) {
  const t = useTranslations('rouletteStyles')
  const style = useSyncExternalStore(subscribe, getStyle, () => defaultStyle)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const [reveal, setReveal] = useState<number | null>(null)
  const revealSequence = useRef(0)
  const menu = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const externalSpinningChange = props.onSpinningChange
  const onSpinningChange = useCallback((spinning: boolean) => {
    if (spinning) setReveal(null)
    setBusy(spinning)
    externalSpinningChange?.(spinning)
  }, [externalSpinningChange])
  const externalResult = props.onResult
  const onResult = useCallback<RouletteWheelProps['onResult']>((champion) => {
    playRouletteSound('winner')
    revealSequence.current += 1
    setReveal(revealSequence.current)
    return externalResult(champion)
  }, [externalResult])

  useEffect(() => {
    if (!open) return
    function dismiss(event: PointerEvent) {
      if (!menu.current?.contains(event.target as Node)) setOpen(false)
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [open])
  function selectStyle(next: RouletteStyle) {
    if (busy) return
    setReveal(null)
    saveStyle(next)
    setOpen(false)
    trigger.current?.focus()
  }
  return (
    <section
      className={machineStyles.surface + " relative min-w-0"}
      aria-label={t('label')}
      onClickCapture={unlockRouletteAudio}
      onKeyDownCapture={event => {
        if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) unlockRouletteAudio()
      }}
    >
      <div ref={menu} className="absolute top-2 end-2 z-[150]">
        <button ref={trigger} type="button" onClick={() => setOpen(value => !value)} disabled={busy} aria-label={t('label')} title={t('label')} aria-expanded={open} aria-haspopup="dialog" aria-controls="roulette-customization" className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#C89B3C]/35 bg-[#101218]/95 text-[#d9bc80] shadow-lg backdrop-blur-sm transition hover:border-[#C89B3C]/70 hover:bg-[#242119] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B3C] disabled:cursor-not-allowed disabled:opacity-35">
          <SlidersHorizontal size={16} strokeWidth={1.6} aria-hidden="true" />
          <span aria-hidden="true" className="pointer-events-none absolute -top-1 -end-1 size-3 rounded-full bg-yellow-300 shadow-[0_0_6px_#facc15] motion-safe:animate-pulse" />
          {!open && !busy && (
            <span aria-hidden="true" className="pointer-events-none absolute end-full top-1/2 me-2 flex -translate-y-1/2 items-center gap-1.5 rounded-md border border-[#c89b3c]/45 bg-[#151311]/95 px-2 py-1 text-xs font-bold text-[#ffe08a] shadow-lg">
              Try
              <span className={machineStyles.tryArrow}>
                <ArrowRight size={16} strokeWidth={2.4} className="rtl:rotate-180" />
              </span>
            </span>
          )}
        </button>
        {open && (
          <div id="roulette-customization" role="dialog" aria-label={t('label')} className="absolute top-11 end-0 w-52 rounded-xl border border-[#C89B3C]/25 bg-[#101218]/98 p-2 shadow-[0_16px_48px_#000a] backdrop-blur-xl">
            <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-neutral-500">{t('label')}</p>
            {(Object.keys(styleIcons) as RouletteStyle[]).map(value => {
              const Icon = styleIcons[value]
              return <button key={value} type="button" aria-pressed={style === value} onClick={() => selectStyle(value)} className={'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-xs transition focus-visible:outline-2 focus-visible:outline-[#C89B3C] ' + (style === value ? 'bg-[#C89B3C]/10 text-[#e3c78d]' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200')}>
                <Icon size={16} aria-hidden="true" /><span className="flex-1">{t(value)}</span>{style === value && <Check size={13} aria-hidden="true" />}
              </button>
            })}
          </div>
        )}
      </div>
      <div className="relative">
        {style === 'classic'
          ? <RouletteWheel {...props} onResult={onResult} onSpinningChange={onSpinningChange} />
          : <SlotMachineRoulette key={style} {...props} variant={style} onResult={onResult} onSpinningChange={onSpinningChange} />}
        {reveal !== null && (
          <div key={reveal} className={revealStyles.reveal} data-mode={style} aria-hidden="true" onAnimationEnd={event => {
            if (event.target === event.currentTarget) setReveal(current => current === reveal ? null : current)
          }}>
            <div className={revealStyles.glow} />
            <div className={revealStyles.ring} />
            <div className={revealStyles.sparks} />
          </div>
        )}
      </div>
    </section>
  )
}
