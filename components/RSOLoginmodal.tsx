// components/HybridLoginModal.tsx
'use client'

import { useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft,
  ChevronDown,
  Globe2,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'

interface HybridLoginModalProps {
  onClose: () => void
  onSuccess: (token: string, user: any) => void
  initialMode?: LoginMode
  variant?: 'modal' | 'inline'
}

type LoginMode = 'choose' | 'oauth' | 'manual'

const REGION_VALUES = [
  { value: 'euw1', key: 'euw' },
  { value: 'eun1', key: 'eune' },
  { value: 'na1', key: 'na' },
  { value: 'kr', key: 'kr' },
  { value: 'br1', key: 'br' },
  { value: 'la1', key: 'lan' },
  { value: 'la2', key: 'las' },
  { value: 'oc1', key: 'oce' },
  { value: 'tr1', key: 'tr' },
  { value: 'ru', key: 'ru' },
  { value: 'jp1', key: 'jp' },
] as const

const displayFont = { fontFamily: '"Bebas Neue", sans-serif' }

const subscribeToHydration = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export default function HybridLoginModal({
  onClose,
  onSuccess,
  initialMode,
  variant = 'modal',
}: HybridLoginModalProps) {
  const t = useTranslations('rsoLogin')
  const [mode, setMode] = useState<LoginMode>(initialMode ?? 'choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  )

  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('euw1')

  const handleOAuthLogin = () => {
    window.location.href = '/api/auth/riot-oauth/authorize'
  }

  const handleManualLogin = async () => {
    setError('')
    setLoading(true)

    try {
      if (!riotId.includes('#')) {
        setError(t('errorInvalidFormat'))
        setLoading(false)
        return
      }

      const [gameName, tagLine] = riotId.split('#')

      if (!gameName || !tagLine) {
        setError(t('errorInvalidRiotId'))
        setLoading(false)
        return
      }

      const verifyResponse = await fetch('/api/auth/verify-riot-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName, tagLine, region }),
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        setError(errorData.error || t('errorNotFound'))
        setLoading(false)
        return
      }

      const riotData = await verifyResponse.json()

      const sessionResponse = await fetch('/api/auth/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puuid: riotData.puuid,
          gameName: riotData.gameName,
          tagLine: riotData.tagLine,
          summonerId: riotData.summonerId,
          summonerName: riotData.summonerName,
          summonerLevel: riotData.summonerLevel,
          profileIconId: riotData.profileIconId,
          region,
        }),
      })

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json()

        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error

        setError(errorMessage || t('errorSession'))
        setLoading(false)
        return
      }

      const { token, user } = await sessionResponse.json()

      Cookies.set('session_token', token, {
        expires: 30,
        secure: true,
        sameSite: 'strict',
      })

      onSuccess(token, user)
    } catch (error: any) {
      setError(t('errorUnexpected', { message: error.message || t('errorSession') }))
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = riotId.includes('#') && !loading

  const card = (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0616]/85 shadow-[0_35px_100px_-30px_rgba(200,155,60,0.45)] backdrop-blur-2xl ${
        variant === 'inline' ? 'mx-auto max-w-md' : 'max-w-lg md:max-w-2xl'
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C89B3C]/80 to-transparent" />
      <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#C89B3C]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative px-6 pb-5 pt-8 text-center sm:px-8">
        {variant === 'modal' && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('back')}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#C89B3C]/30 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C89B3C]/50 bg-gradient-to-br from-[#C89B3C]/35 via-[#C89B3C]/10 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <ShieldCheck className="h-8 w-8 text-[#f0c75e]" />
          </div>
        </div>

        <h2
          className="text-4xl uppercase leading-none tracking-[0.08em] text-white"
          style={displayFont}
        >
          {t('title')}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {mode === 'manual' ? t('manualDesc') : mode === 'oauth' ? t('oauthDesc') : t('chooseMethod')}
        </p>
      </div>

      <div className="relative px-6 pb-7 sm:px-8">
        {mode === 'choose' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setMode('oauth')}
              className="group relative w-full overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-600/20 via-red-600/5 to-transparent p-4 text-left transition hover:border-red-400/50 hover:from-red-600/30"
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-400 to-red-700" />
              <div className="flex items-center gap-4 pl-2">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-600 shadow-[0_0_25px_-5px_rgba(220,38,38,0.8)]">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{t('riotOauth')}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      <Sparkles className="h-3 w-3" />
                      {t('recommended')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{t('oauthDesc')}</p>
                </div>
                <ChevronDown className="h-5 w-5 -rotate-90 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('manual')}
              className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-[#C89B3C]/50 hover:bg-white/[0.05]"
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#f0c75e] to-[#8a6b2a]" />
              <div className="flex items-center gap-4 pl-2">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#C89B3C]/30 bg-[#C89B3C]/15">
                  <User className="h-5 w-5 text-[#f0c75e]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-bold text-white">{t('manualRiotId')}</h3>
                  <p className="text-sm text-zinc-400">{t('manualDesc')}</p>
                </div>
                <ChevronDown className="h-5 w-5 -rotate-90 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
            </button>

            <div className="flex gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-300" />
              <p className="text-xs leading-relaxed text-cyan-100/70">{t('oauthExplanation')}</p>
            </div>
          </div>
        )}

        {mode === 'oauth' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="mb-2 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('back')}
            </button>

            <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
              <div>
                <p className="mb-1 text-sm font-semibold text-emerald-300">{t('officialAuth')}</p>
                <p className="text-xs text-emerald-100/70">{t('officialDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-300" />
              <div>
                <p className="mb-1 text-sm font-semibold text-cyan-200">{t('noPassword')}</p>
                <p className="text-xs text-cyan-100/70">{t('noPasswordDesc')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOAuthLogin}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3.5 font-bold text-white shadow-[0_10px_35px_-12px_rgba(220,38,38,0.9)] transition hover:brightness-110"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
                {t('continueOauth')}
              </span>
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="mb-2 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('back')}
            </button>

            <div>
              <label
                htmlFor="riot-id"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400"
              >
                {t('riotIdLabel')}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="riot-id"
                  type="text"
                  placeholder={t('riotIdPlaceholder')}
                  value={riotId}
                  onChange={(event) => {
                    setRiotId(event.target.value)
                    setError('')
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && canSubmit) handleManualLogin()
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-base leading-normal text-white outline-none transition placeholder:text-zinc-500 focus:border-[#C89B3C]/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#C89B3C]/20 disabled:opacity-60"
                />
              </div>
              <p className="mt-2 pl-1 text-xs text-zinc-500">{t('findRiotId')}</p>
            </div>

            <div>
              <label
                htmlFor="region"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400"
              >
                {t('regionLabel')}
              </label>
              <div className="relative">
                <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <select
                  id="region"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  disabled={loading}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-11 text-base text-white outline-none transition focus:border-[#C89B3C]/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#C89B3C]/20 disabled:opacity-60"
                >
                  {REGION_VALUES.map((item) => (
                    <option key={item.value} value={item.value} className="bg-neutral-900">
                      {t(`regions.${item.key}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleManualLogin}
              disabled={!canSubmit}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#C89B3C] via-[#e0b45a] to-[#C89B3C] py-3.5 font-bold text-neutral-950 shadow-[0_10px_35px_-12px_rgba(200,155,60,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {t('verifying')}
                  </>
                ) : (
                  t('loginButton')
                )}
              </span>
            </button>

            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-300" />
              <div>
                <p className="mb-1 text-xs font-semibold text-white">{t('howThisWorks')}</p>
                <p className="text-xs leading-relaxed text-zinc-400">{t('howThisWorksDesc')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (variant === 'inline') {
    return card
  }

  if (!mounted) {
    return null
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-md"
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        {card}
      </div>
    </div>,
    document.body
  )
}
