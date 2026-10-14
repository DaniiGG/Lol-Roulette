'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { AlertTriangle, Check, LoaderCircle, Play, RotateCcw, ShieldCheck, X } from 'lucide-react'
import { getAvailableChallenges } from '@/lib/challenge-definitions'
import { CHAMPION_CLASSES, CHAMPION_REGIONS } from '@/lib/champion-metadata'
import { completeChallengeSession, startChallengeSession, validateChallengeMatch } from '@/lib/api-client'
import type { ChallengeSessionWithDefinition } from '@/lib/supabase'
import VerificationResult from '@/components/VerificationResult'

type TestUser = {
  id: string
  puuid: string
  region: string
  game_name: string
  tag_line: string
}

type TestResult = {
  title: string
  data: unknown
  ok: boolean
  verification?: VerificationResultData
}

type VerificationResultData = {
  pending?: boolean
  message?: string
  success?: boolean
  playedCorrectChampion?: boolean
  won?: boolean
  championPlayed?: string
  stats?: { kills: number; deaths: number; assists: number; cs: number; gold: number }
}

type ActiveTestSession = ChallengeSessionWithDefinition & {
  definition?: ChallengeSessionWithDefinition['definition'] | null
}

const challenges = getAvailableChallenges()
const championNames = Array.from(new Set([
  ...Object.keys(CHAMPION_REGIONS),
  ...Object.keys(CHAMPION_CLASSES),
])).sort()

async function fetchActiveSession(token: string): Promise<ActiveTestSession | null> {
  const response = await fetch('/api/challenge-sessions', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
  return data.activeSession as ActiveTestSession | null
}

export default function LocalTestConsole() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<TestUser | null>(null)
  const [authMessage, setAuthMessage] = useState('Inicia sesión en League Roulette para probar los endpoints autenticados.')
  const [activeSession, setActiveSession] = useState<ActiveTestSession | null>(null)
  const [selectedChallengeId, setSelectedChallengeId] = useState(challenges[0]?.id || '')
  const [selectedTestChampion, setSelectedTestChampion] = useState('')
  const [expectedChampionId, setExpectedChampionId] = useState(103)
  const [expectedChampionName, setExpectedChampionName] = useState('Ahri')
  const [playedChampionId, setPlayedChampionId] = useState(103)
  const [championPlayed, setChampionPlayed] = useState('Ahri')
  const [won, setWon] = useState(true)
  const [gameMode, setGameMode] = useState('RANKED')
  const [gameDuration, setGameDuration] = useState(1800)
  const [stats, setStats] = useState({ kills: 5, deaths: 2, assists: 8, cs: 180, gold: 12000 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TestResult | null>(null)

  useEffect(() => {
    const sessionToken = Cookies.get('session_token')
    if (!sessionToken) return

    let cancelled = false
    const loadUserSession = async () => {
      try {
        const response = await fetch('/api/auth/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
        if (cancelled) return

        setToken(sessionToken)
        setUser(data.user)
        setAuthMessage('Sesión autenticada')
        try {
          const session = await fetchActiveSession(sessionToken)
          if (!cancelled) setActiveSession(session)
        } catch (sessionError) {
          if (!cancelled) setError(sessionError instanceof Error ? sessionError.message : 'No se pudo cargar el challenge activo')
        }
      } catch (sessionError) {
        if (cancelled) return
        setAuthMessage('No se pudo validar la sesión')
        setError(sessionError instanceof Error ? sessionError.message : 'Error de autenticación')
      }
    }

    void loadUserSession()
    return () => { cancelled = true }
  }, [])

  const selectedChallenge = challenges.find((challenge) => challenge.id === selectedChallengeId)
  const challengeType = activeSession?.challenge_type || selectedChallenge?.type
  const challengeConfig = activeSession?.challenge_config || selectedChallenge?.config
  const validChampions = challengeType && challengeConfig
    ? championNames.filter((name) => {
        if (challengeType === 'region') {
          return CHAMPION_REGIONS[name]?.includes(challengeConfig.region?.region || '')
        }
        if (challengeType === 'class') {
          return CHAMPION_CLASSES[name]?.includes(challengeConfig.class?.class || '')
        }
        return true
      })
    : []
  const selectedChampionIsValid = activeSession?.challenge_type === 'low_mastery'
    ? null
    : validChampions.includes(selectedTestChampion)

  const runAction = async (action: () => Promise<unknown>, title: string) => {
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const data = await action()
      setResult({ title, data, ok: true })
      return data
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Error inesperado'
      setError(message)
      setResult({ title, data: { error: message }, ok: false })
      return null
    } finally {
      setBusy(false)
    }
  }

  const verifySimulatedMatch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return

    const data = await runAction(async () => {
      const response = await fetch('/api/test-tools/verify-simulated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expectedChampionId,
          playedChampionId,
          championPlayed,
          won,
          gameMode,
          gameDuration,
          stats,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      return data
    }, 'Resultado de partida simulada')

    if (data && typeof data === 'object') {
      setResult({
        title: 'Resultado de partida simulada',
        data,
        ok: true,
        verification: data as VerificationResultData,
      })
    }
  }

  const setScenario = (scenario: 'win' | 'loss' | 'wrong-champion') => {
    if (scenario === 'wrong-champion') {
      setPlayedChampionId(expectedChampionId === 103 ? 157 : 103)
      setChampionPlayed(expectedChampionId === 103 ? 'Yasuo' : 'Ahri')
      setWon(true)
      return
    }

    setPlayedChampionId(expectedChampionId)
    setChampionPlayed(expectedChampionName)
    setWon(scenario === 'win')
  }

  const activateChallenge = async () => {
    if (!token || !selectedChallenge) return
    const data = await runAction(
      () => startChallengeSession(token, { challenge_id: selectedChallenge.id }),
      'Challenge activado',
    )
    if (data && typeof data === 'object' && 'session' in data) {
      setActiveSession(data.session as ActiveTestSession)
    }
  }

  const simulateChallengeMatch = async (won: boolean) => {
    if (!token || !activeSession) return
    if (!selectedTestChampion) {
      setError('Selecciona el campeón que quieres probar.')
      return
    }

    const data = await runAction(() => validateChallengeMatch(token, {
      match_id: `LOCAL-TEST-${crypto.randomUUID()}`,
      champion_name: selectedTestChampion,
      champion_id: 1,
      won,
      game_mode: 'CLASSIC',
      game_duration: 1800,
      game_end_timestamp: new Date().toISOString(),
      stats: { kills: 5, deaths: 3, assists: 8, cs: 150, gold: 12000 },
    }), won ? 'Prueba de victoria' : 'Prueba de derrota')

    if (data && typeof data === 'object' && 'session' in data) {
      setActiveSession(data.session as ActiveTestSession)
    }
    else if (token) {
      try {
        setActiveSession(await fetchActiveSession(token))
      } catch {
        setActiveSession(null)
      }
    }
  }

  const closeChallenge = async () => {
    if (!token || !activeSession) return
    const data = await runAction(
      () => completeChallengeSession(token, { session_id: activeSession.id }),
      'Challenge cerrado',
    )
    if (data) setActiveSession(null)
  }

  const refreshChallenge = async () => {
    if (!token) return
    const data = await runAction(() => fetchActiveSession(token), 'Estado actualizado')
    if (data === null) {
      setActiveSession(null)
    } else if (data && typeof data === 'object' && 'id' in data) {
      setActiveSession(data as ActiveTestSession)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-neutral-800 pb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">LOCALHOST · DEV ONLY</p>
          <h1 className="text-3xl font-bold">Consola de pruebas</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
            Simula datos de partida y comprueba el resultado sin depender de tu última partida real.
          </p>
        </header>

        <div role="note" className="flex items-start gap-3 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            La simulación de verificación no consulta Riot ni guarda datos. Activar o cerrar challenges sí modifica tu cuenta; una victoria simulada válida también suma XP.
            Usa esa sección solo con una cuenta de pruebas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-neutral-800 py-3 text-sm">
          <div className="flex items-center gap-2">
            {user ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
            <span className={user ? 'text-emerald-300' : 'text-neutral-300'}>{authMessage}</span>
          </div>
          {user && <span className="text-neutral-500">{user.game_name}#{user.tag_line} · {user.region}</span>}
        </div>

        {error && <p role="alert" className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-4" aria-labelledby="verify-heading">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
              <h2 id="verify-heading" className="text-xl font-semibold">Simular partida y verificar</h2>
            </div>
            <p className="text-sm text-neutral-400">El endpoint local evalúa los datos que introduces con la misma comparación de campeón y victoria que usa la verificación real.</p>
            <form onSubmit={verifySimulatedMatch} className="space-y-4 border-t border-neutral-800 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="text-neutral-400">Campeón esperado · ID</span>
                  <input type="number" min="1" required value={expectedChampionId} onChange={(event) => setExpectedChampionId(Number(event.target.value))} className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-neutral-400">Nombre esperado</span>
                  <input type="text" required value={expectedChampionName} onChange={(event) => setExpectedChampionName(event.target.value)} className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-neutral-400">Campeón jugado · ID</span>
                  <input type="number" min="1" required value={playedChampionId} onChange={(event) => setPlayedChampionId(Number(event.target.value))} className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-neutral-400">Nombre jugado</span>
                  <input type="text" required value={championPlayed} onChange={(event) => setChampionPlayed(event.target.value)} className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-neutral-400">Resultado</span>
                  <select value={won ? 'win' : 'loss'} onChange={(event) => setWon(event.target.value === 'win')} className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white">
                    <option value="win">Victoria</option>
                    <option value="loss">Derrota</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-neutral-400">Modo de juego</span>
                  <select value={gameMode} onChange={(event) => setGameMode(event.target.value)} className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white">
                    <option value="RANKED">Ranked</option>
                    <option value="CLASSIC">Normal</option>
                    <option value="ARAM">ARAM</option>
                    <option value="CHERRY">Arena</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setScenario('win')} className="border border-emerald-400/30 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-400/10">Victoria correcta</button>
                <button type="button" onClick={() => setScenario('loss')} className="border border-amber-400/30 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-400/10">Derrota correcta</button>
                <button type="button" onClick={() => setScenario('wrong-champion')} className="border border-red-400/30 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-400/10">Campeón incorrecto</button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {([['kills', 'Asesinatos'], ['deaths', 'Muertes'], ['assists', 'Asistencias'], ['cs', 'CS'], ['gold', 'Oro'], ['gameDuration', 'Duración (segundos)']] as const).map(([key, label]) => (
                  <label key={key} className="space-y-1.5 text-sm">
                    <span className="text-neutral-400">{label}</span>
                    <input
                      type="number"
                      min="0"
                      value={key === 'gameDuration' ? gameDuration : stats[key]}
                      onChange={(event) => key === 'gameDuration'
                        ? setGameDuration(Number(event.target.value))
                        : setStats((previous) => ({ ...previous, [key]: Number(event.target.value) }))}
                      className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white"
                    />
                  </label>
                ))}
              </div>

              <button type="submit" disabled={!token || busy || !expectedChampionId || !playedChampionId} className="inline-flex w-full items-center justify-center gap-2 bg-cyan-300 px-4 py-3 font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40">
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Simular y verificar partida
              </button>
            </form>
          </section>

          <section className="space-y-4" aria-labelledby="challenge-heading">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-amber-300" />
              <h2 id="challenge-heading" className="text-xl font-semibold">Probar challenges</h2>
            </div>
            <p className="text-sm text-neutral-400">Activa un reto disponible y envía resultados de prueba al endpoint de validación.</p>

            {activeSession ? (
              <div className="space-y-4 border-t border-neutral-800 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Challenge activo</p>
                    <p className="mt-1 font-semibold">{activeSession.definition?.name || activeSession.challenge_type}</p>
                    <p className="mt-1 text-xs text-neutral-500">{activeSession.valid_wins} victorias · +{activeSession.bonus_xp} XP · x{activeSession.xp_multiplier}</p>
                    <p className="mt-1 text-xs text-neutral-400">La prueba válida usará: {validChampions[0] || 'sin campeón válido disponible'}</p>
                  </div>
                  <button type="button" onClick={refreshChallenge} disabled={busy} aria-label="Actualizar challenge" title="Actualizar" className="p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-40">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
                <label className="block space-y-1.5 text-sm">
                  <span className="text-neutral-400">Campeón de la partida simulada</span>
                  <select value={selectedTestChampion} onChange={(event) => setSelectedTestChampion(event.target.value)} className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white">
                    <option value="">Selecciona un campeón</option>
                    {championNames.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                  {selectedTestChampion && activeSession.challenge_type !== 'low_mastery' && (
                    <span className={`block text-xs ${selectedChampionIsValid ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {selectedChampionIsValid ? 'Cumple el requisito de este challenge.' : 'No cumple el requisito; el endpoint debería rechazarlo.'}
                    </span>
                  )}
                  {activeSession.challenge_type === 'low_mastery' && (
                    <span className="block text-xs text-amber-300">La API todavía no valida los puntos de maestría reales.</span>
                  )}
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <button type="button" onClick={() => simulateChallengeMatch(true)} disabled={busy || !selectedTestChampion} className="bg-emerald-400 px-3 py-2.5 text-sm font-semibold text-neutral-950 disabled:opacity-40">Simular victoria</button>
                  <button type="button" onClick={() => simulateChallengeMatch(false)} disabled={busy || !selectedTestChampion} className="bg-neutral-800 px-3 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-40">Simular derrota</button>
                </div>
                <button type="button" onClick={closeChallenge} disabled={busy} className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white disabled:opacity-40">
                  <X className="h-4 w-4" /> Cerrar challenge de prueba
                </button>
              </div>
            ) : (
              <div className="space-y-4 border-t border-neutral-800 pt-4">
                <label className="block space-y-1.5 text-sm">
                  <span className="text-neutral-400">Challenge disponible</span>
                  <select value={selectedChallengeId} onChange={(event) => setSelectedChallengeId(event.target.value)} className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-white">
                    {challenges.map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.name}</option>)}
                  </select>
                </label>
                {selectedChallenge && <p className="text-xs leading-5 text-neutral-500">{selectedChallenge.description}{validChampions[0] ? ` Campeón válido para la prueba: ${validChampions[0]}.` : ''}</p>}
                <button type="button" onClick={activateChallenge} disabled={!token || busy || !selectedChallenge} className="inline-flex w-full items-center justify-center gap-2 bg-amber-300 px-4 py-3 font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40">
                  {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Activar challenge seleccionado
                </button>
              </div>
            )}
          </section>
        </div>

        {result && (
          <section className="border-t border-neutral-800 pt-5" aria-live="polite">
            <div className="mb-3 flex items-center gap-2">
              {result.ok ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-red-400" />}
              <h2 className="font-semibold">{result.title}</h2>
            </div>
            {result.verification && (
              <div className="mb-4">
                <VerificationResult result={result.verification} championName={expectedChampionName} />
              </div>
            )}
            <pre className="max-h-80 overflow-auto border border-neutral-800 bg-neutral-900 p-4 text-xs leading-5 text-neutral-300">{JSON.stringify(result.data, null, 2)}</pre>
          </section>
        )}
      </div>
    </main>
  )
}