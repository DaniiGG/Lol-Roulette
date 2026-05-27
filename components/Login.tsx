// components/Login.tsx (MEJORADO)
'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface LoginProps {
  onLogin: (riotId: string, region: string) => void
  loading?: boolean
}

const REGIONS = [
  { value: 'euw1', label: 'EUW', routing: 'europe' },
  { value: 'eun1', label: 'EUNE', routing: 'europe' },
  { value: 'na1', label: 'NA', routing: 'americas' },
  { value: 'br1', label: 'BR', routing: 'americas' },
  { value: 'la1', label: 'LAN', routing: 'americas' },
  { value: 'la2', label: 'LAS', routing: 'americas' },
  { value: 'kr', label: 'KR', routing: 'asia' },
  { value: 'jp1', label: 'JP', routing: 'asia' },
  { value: 'oc1', label: 'OCE', routing: 'americas' },
  { value: 'tr1', label: 'TR', routing: 'europe' },
  { value: 'ru', label: 'RU', routing: 'europe' }
]

export default function Login({ onLogin, loading = false }: LoginProps) {
  const t = useTranslations('login')
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('euw1')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

    if (!riotId.trim()) {
      setError(t('errorRequired'))
      return
    }

    if (!riotId.includes('#')) {
      setError(t('errorFormat'))
      return
    }

    const parts = riotId.split('#')
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setError(t('errorFormatExample'))
      return
    }

    onLogin(riotId.trim(), region)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-900/40 backdrop-blur-xl rounded-3xl border border-neutral-800/50 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extralight text-white mb-2">
            {t('title')}
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-neutral-500 to-transparent"></div>
            <p className="text-neutral-400 text-xs tracking-widest uppercase">
              {t('subtitle')}
            </p>
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-neutral-500 to-transparent"></div>
          </div>
          <p className="text-neutral-500 text-sm">
            {t('enterRiotId')}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-neutral-400 text-sm mb-2">
              {t('riotId')}
            </label>
            <input
              type="text"
              placeholder={t('riotIdPlaceholder')}
              value={riotId}
              onChange={(e) => {
                setRiotId(e.target.value)
                setError('')
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition disabled:opacity-50"
            />
            <p className="text-neutral-600 text-xs mt-2">
              {t('example')}
            </p>
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">
              {t('region')}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-white transition disabled:opacity-50"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-neutral-950/20 border-t-neutral-950 rounded-full animate-spin"></div>
                {t('verifying')}
              </span>
            ) : (
              t('startPlaying')
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold text-sm mb-2">
            {t('secureAuth')}
          </h3>
          <p className="text-blue-300/80 text-xs leading-relaxed">
            {t('secureDesc')}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-neutral-600 text-xs">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </main>
  )
}
