'use client'

import Image from 'next/image'
import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react'
import { championIconUrl } from '@/lib/champion-data'
import { drawTeams, readDraw, type Champion, type Draw, type Role } from './team-draw'

const copy = {
  en: {
    players: 'Player names',
    help: 'Enter 2 to 10 names, one per line, up to 50 characters each.',
    roles: 'Assign random roles',
    champions: 'Draw unique champions',
    draw: 'Shuffle teams',
    blue: 'Blue team',
    red: 'Red team',
    pending: 'Your teams will appear here after the draw.',
    copy: 'Copy result link',
    copied: 'Link copied.',
    manual: 'Copy this link to share your teams.',
    warning: 'Anyone with the link can see the names you enter.',
  },
  es: {
    players: 'Nombres de los jugadores',
    help: 'Escribe de 2 a 10 nombres, uno por línea, con hasta 50 caracteres cada uno.',
    roles: 'Sortear posiciones',
    champions: 'Sortear campeones sin repetir',
    draw: 'Sortear equipos',
    blue: 'Equipo azul',
    red: 'Equipo rojo',
    pending: 'Tus equipos aparecerán aquí al hacer el sorteo.',
    copy: 'Copiar enlace del resultado',
    copied: 'Enlace copiado.',
    manual: 'Copia este enlace para compartir los equipos.',
    warning: 'Cualquiera que tenga el enlace podrá ver los nombres que escribas.',
  },
}

const roleLabels: Record<'en' | 'es', Record<Role, string>> = {
  en: { top: 'Top', jungle: 'Jungle', mid: 'Mid', adc: 'ADC', support: 'Support' },
  es: { top: 'Top', jungle: 'Jungla', mid: 'Mid', adc: 'ADC', support: 'Soporte' },
}

function subscribeToHash(listener: () => void) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

export default function TeamGenerator({ locale, champions }: { locale: 'en' | 'es'; champions: Champion[] }) {
  const t = copy[locale]
  const catalog = useMemo(() => new Map(champions.map(champion => [champion.id, champion])), [champions])
  const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => '')
  const shared = useMemo(() => readDraw(hash, catalog), [hash, catalog])

  return <DrawPanel key={hash} locale={locale} shared={shared} catalog={catalog} t={t} />
}

function DrawPanel({ locale, shared, catalog, t }: {
  locale: 'en' | 'es'
  shared: Draw | null
  catalog: ReadonlyMap<string, Champion>
  t: (typeof copy)[keyof typeof copy]
}) {
  const [input, setInput] = useState(() => shared?.flat().map(player => player.name).join('\n') ?? '')
  const [assignRoles, setAssignRoles] = useState(() => shared?.flat().some(player => player.role) ?? false)
  const [assignChampions, setAssignChampions] = useState(() => shared?.flat().some(player => player.champion) ?? false)
  const [result, setResult] = useState(shared)
  const [invalid, setInvalid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [manualLink, setManualLink] = useState('')

  function handleDraw(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const names = input.split(/\r?\n/).map(name => name.trim()).filter(Boolean)
    const invalidNames = names.length < 2 || names.length > 10 || names.some(name => name.length > 50)
    setInvalid(invalidNames)
    if (invalidNames) return
    setResult(drawTeams(names, assignChampions ? [...catalog.values()] : [], assignRoles))
    setCopied(false)
    setManualLink('')
  }

  async function copyResult() {
    if (!result) return
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = 'teams=' + encodeURIComponent(JSON.stringify(result))
    try {
      await navigator.clipboard.writeText(url.href)
      setManualLink('')
      setCopied(true)
    } catch {
      setManualLink(url.href)
    }
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <form onSubmit={handleDraw} className="rounded-2xl border border-white/10 bg-[#101520] p-5 sm:p-6">
        <label htmlFor="team-players" className="font-semibold">{t.players}</label>
        <p id="team-players-help" className="mb-3 mt-1 text-sm text-zinc-400">{t.help}</p>
        <textarea
          id="team-players"
          aria-describedby="team-players-help"
          aria-invalid={invalid}
          rows={7}
          maxLength={1000}
          value={input}
          onChange={event => { setInput(event.target.value); setInvalid(false) }}
          className="w-full resize-y rounded-xl border border-white/15 bg-[#080b12] p-3 focus-visible:outline-2 focus-visible:outline-cyan-300"
        />
        {invalid && <p role="alert" className="mt-2 text-sm text-rose-300">{t.help}</p>}
        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={assignRoles} onChange={event => setAssignRoles(event.target.checked)} className="size-4 accent-cyan-300" />
          {t.roles}
        </label>
        <label className="mt-3 flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={assignChampions} onChange={event => setAssignChampions(event.target.checked)} className="size-4 accent-cyan-300" />
          {t.champions}
        </label>
        <button type="submit" className="mt-6 w-full cursor-pointer rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
          {t.draw}
        </button>
      </form>
      <div>
        <div className="grid gap-4 sm:grid-cols-2" aria-live="polite">
          {[t.blue, t.red].map((teamName, team) => (
            <section key={teamName} className="min-h-28 rounded-2xl border border-white/10 bg-[#101520] p-5">
              <h2 className={team === 0 ? 'text-xl font-bold text-cyan-300' : 'text-xl font-bold text-rose-300'}>{teamName}</h2>
              {result ? (
                <ul className="mt-3 divide-y divide-white/10">
                  {result[team].map((player, index) => {
                    const champion = player.champion ? catalog.get(player.champion) : undefined
                    return (
                      <li key={index} className="flex min-h-12 items-center gap-3 py-2">
                        {champion && <Image src={championIconUrl(champion.id)} alt="" width={40} height={40} className="rounded-md" />}
                        <div className="min-w-0">
                          <p className="break-words font-semibold">{player.name}</p>
                          {(player.role || champion) && (
                            <p className="text-sm text-zinc-400">
                              {[player.role && roleLabels[locale][player.role], champion?.name].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : <p className="mt-2 text-zinc-400">{t.pending}</p>}
            </section>
          ))}
        </div>
        {result && (
          <div className="mt-4">
            <button type="button" onClick={copyResult} className="cursor-pointer rounded-lg border border-white/20 px-4 py-2 font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-300">
              {t.copy}
            </button>
            <p className="mt-2 text-sm text-zinc-400">{t.warning}</p>
            {copied && <p role="status" className="mt-2 text-sm text-cyan-300">{t.copied}</p>}
            {manualLink && (
              <label className="mt-3 block text-sm text-zinc-300">
                {t.manual}
                <input readOnly value={manualLink} onFocus={event => event.target.select()} className="mt-2 block w-full rounded-lg border border-white/20 bg-[#101520] p-2 text-white" />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
