'use client'

import Image from 'next/image'
import { useState, useSyncExternalStore } from 'react'
import { Dices } from 'lucide-react'
import { championIconUrl } from '@/lib/champion-data'
import { pairs, styles, type Style } from './duos'

type Pair = (typeof pairs)[number]
type Filter = 'any' | Style

const copy = {
  en: {
    filter: 'Playstyle',
    styles: { any: 'Any', aggressive: 'Aggressive', safe: 'Safe', unusual: 'Unusual' },
    roll: 'Roll a duo',
    initial: 'Roll the roulette to reveal your bot lane duo.',
    carry: 'ADC / bot carry',
    support: 'Support',
    share: 'Copy duo link',
    copied: 'Link copied.',
    manual: 'Copy this link to share the duo.',
  },
  es: {
    filter: 'Estilo de juego',
    styles: { any: 'Cualquiera', aggressive: 'Agresivo', safe: 'Seguro', unusual: 'Raro' },
    roll: 'Sortear dúo',
    initial: 'Gira la ruleta para descubrir tu pareja de bot.',
    carry: 'ADC / carry de bot',
    support: 'Support',
    share: 'Copiar enlace del dúo',
    copied: 'Enlace copiado.',
    manual: 'Copia este enlace para compartir el dúo.',
  },
}

type Props = { locale: 'en' | 'es'; names: Record<string, string> }

function subscribeToHash(listener: () => void) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

export default function DuoRoulette(props: Props) {
  const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => '')
  const shared = pairs.find(pair => hash === '#duo=' + pair.id)
  return <DuoPanel key={hash} {...props} shared={shared} />
}

function DuoPanel({ locale, names, shared }: Props & { shared?: Pair }) {
  const t = copy[locale]
  const [filter, setFilter] = useState<Filter>(shared?.style ?? 'any')
  const [result, setResult] = useState(shared)
  const [copied, setCopied] = useState(false)
  const [manualLink, setManualLink] = useState('')

  function roll() {
    const eligible = pairs.filter(pair => (filter === 'any' || pair.style === filter) && pair.id !== result?.id)
    setResult(eligible[Math.floor(Math.random() * eligible.length)])
    setCopied(false)
    setManualLink('')
  }

  async function share() {
    if (!result) return
    const url = new URL(window.location.pathname, window.location.origin)
    url.hash = 'duo=' + result.id
    try {
      await navigator.clipboard.writeText(url.href)
      setCopied(true)
      setManualLink('')
    } catch {
      setCopied(false)
      setManualLink(url.href)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#101520] p-5 sm:p-8" aria-label={t.roll}>
      <fieldset>
        <legend className="mb-3 font-semibold">{t.filter}</legend>
        <div className="flex flex-wrap gap-2">
          {(['any', ...styles] as const).map(value => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="duo-style" checked={filter === value} onChange={() => setFilter(value)} className="peer sr-only" />
              <span className="block rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 peer-checked:border-cyan-300 peer-checked:bg-cyan-300/10 peer-checked:text-cyan-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-300">
                {t.styles[value]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="button" onClick={roll} className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
        <Dices size={20} aria-hidden="true" />{t.roll}
      </button>
      <div aria-live="polite" aria-atomic="true" className="mt-6">
        {result ? (
          <>
            <p className="mb-3 text-sm font-medium text-zinc-300">{t.styles[result.style]}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[[result.adc, t.carry], [result.support, t.support]].map(([id, role]) => (
                <div key={role} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#080b12] p-4">
                  <Image src={championIconUrl(id)} alt="" width={56} height={56} className="rounded-lg" />
                  <div>
                    <p className="text-sm font-medium text-cyan-300">{role}</p>
                    <p className="text-xl font-bold text-white">{names[id] ?? id}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : <p className="rounded-xl border border-white/10 bg-[#080b12] p-4 text-zinc-400">{t.initial}</p>}
      </div>
      {result && (
        <div className="mt-4">
          <button type="button" onClick={share} className="cursor-pointer rounded-lg border border-white/20 px-4 py-2 font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-300">{t.share}</button>
          {copied && <p role="status" className="mt-2 text-sm text-cyan-300">{t.copied}</p>}
          {manualLink && (
            <label className="mt-3 block text-sm text-zinc-300">
              {t.manual}
              <input readOnly value={manualLink} onFocus={event => event.target.select()} className="mt-2 block w-full rounded-lg border border-white/20 bg-[#080b12] p-2 text-white" />
            </label>
          )}
        </div>
      )}
    </section>
  )
}
