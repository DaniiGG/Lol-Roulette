'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { Check, CircleDot, GalleryVerticalEnd, SlidersHorizontal } from 'lucide-react'
import RouletteWheel, { type RouletteWheelProps } from './RouletteWheel'
import SlotMachineRoulette from './Slotmachineroulette'
import machineStyles from './RouletteAppearance.module.css'

const STORAGE_KEY = 'league-roulette-style'
const CHANGE_EVENT = 'league-roulette-style-change'
let memoryStyle = 'classic'
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}
function getStyle() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'slots' || stored === 'classic' ? stored : memoryStyle
  } catch { return memoryStyle }
}

function saveStyle(next: string) {
  memoryStyle = next
  try { localStorage.setItem(STORAGE_KEY, next) } catch { /* Preserve the selection for this visit. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export default function RouletteSwitcher(props: RouletteWheelProps) {
  const t = useTranslations('rouletteStyles')
  const style = useSyncExternalStore(subscribe, getStyle, () => 'classic')
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const externalSpinningChange = props.onSpinningChange
  const onSpinningChange = useCallback((spinning: boolean) => {
    setBusy(spinning)
    externalSpinningChange?.(spinning)
  }, [externalSpinningChange])
  const Roulette = style === 'slots' ? SlotMachineRoulette : RouletteWheel

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
  function selectStyle(next: string) {
    if (busy) return
    saveStyle(next)
    setOpen(false)
    trigger.current?.focus()
  }
  return (
    <section className={machineStyles.surface + " relative min-w-0"} aria-label={t('label')}>
      <div ref={menu} className="absolute right-2 top-2 z-[150]">
        <button ref={trigger} type="button" onClick={() => setOpen(value => !value)} disabled={busy} aria-label={t('label')} title={t('label')} aria-expanded={open} aria-haspopup="dialog" aria-controls="roulette-customization" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C89B3C]/35 bg-[#101218]/95 text-[#d9bc80] shadow-lg backdrop-blur-sm transition hover:border-[#C89B3C]/70 hover:bg-[#242119] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B3C] disabled:cursor-not-allowed disabled:opacity-35">
          <SlidersHorizontal size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
        {open && <div id="roulette-customization" role="dialog" aria-label={t('label')} className="absolute right-0 top-11 w-52 rounded-xl border border-[#C89B3C]/25 bg-[#101218]/98 p-2 shadow-[0_16px_48px_#000a] backdrop-blur-xl">
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-neutral-500">{t('label')}</p>
          {(['classic', 'slots'] as const).map(value => {
            const Icon = value === 'classic' ? CircleDot : GalleryVerticalEnd
            return <button key={value} type="button" aria-pressed={style === value} onClick={() => selectStyle(value)} className={'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-xs transition focus-visible:outline-2 focus-visible:outline-[#C89B3C] ' + (style === value ? 'bg-[#C89B3C]/10 text-[#e3c78d]' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200')}>
              <Icon size={16} aria-hidden="true" /><span className="flex-1">{t(value)}</span>{style === value && <Check size={13} aria-hidden="true" />}
            </button>
          })}
        </div>}
      </div>
      <Roulette {...props} onSpinningChange={onSpinningChange} />
    </section>
  )
}
