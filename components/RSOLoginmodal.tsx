// components/HybridLoginModal.tsx
'use client'

import { useState } from 'react'
import Cookies from 'js-cookie'

interface HybridLoginModalProps {
  onClose: () => void
  onSuccess: (token: string, user: any) => void
}

type LoginMode = 'choose' | 'oauth' | 'manual'

export default function HybridLoginModal({ onClose, onSuccess }: HybridLoginModalProps) {
  const [mode, setMode] = useState<LoginMode>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Manual login states
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('euw1')

  const REGIONS = [
    { value: 'euw1', label: 'EUW - Europe West' },
    { value: 'eun1', label: 'EUNE - Europe Nordic & East' },
    { value: 'na1', label: 'NA - North America' },
    { value: 'kr', label: 'KR - Korea' },
    { value: 'br1', label: 'BR - Brazil' },
    { value: 'la1', label: 'LAN - Latin America North' },
    { value: 'la2', label: 'LAS - Latin America South' },
    { value: 'oc1', label: 'OCE - Oceania' },
    { value: 'tr1', label: 'TR - Turkey' },
    { value: 'ru', label: 'RU - Russia' },
    { value: 'jp1', label: 'JP - Japan' }
  ]

  // OAuth Login
  const handleOAuthLogin = () => {
    window.location.href = '/api/auth/riot-oauth/authorize'
  }

  // ACTUALIZACIÓN DEL MODAL - Solo la parte de handleManualLogin

const handleManualLogin = async () => {
  setError('')
  setLoading(true)

  try {
    if (!riotId.includes('#')) {
      setError('Invalid format. Use: GameName#TAG (e.g., Faker#KR1)')
      setLoading(false)
      return
    }

    const [gameName, tagLine] = riotId.split('#')

    if (!gameName || !tagLine) {
      setError('Invalid Riot ID format')
      setLoading(false)
      return
    }

    console.log('🔍 Step 1: Verifying Riot ID...')
    
    // Verificar Riot ID y obtener PUUID
    const verifyResponse = await fetch('/api/auth/verify-riot-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName, tagLine, region })
    })

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json()
      console.error('❌ Verify failed:', errorData)
      setError(errorData.error || 'Account not found. Check your Riot ID and region.')
      setLoading(false)
      return
    }

    const riotData = await verifyResponse.json()
    console.log('✅ Riot ID verified:', riotData)

    console.log('🔍 Step 2: Creating session...')
    
    // Crear sesión
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
        region: region
      })
    })

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json()
      console.error('❌ Session creation failed:', errorData)
      
      // Mostrar error detallado
      const errorMessage = errorData.details 
        ? `${errorData.error}: ${errorData.details}` 
        : errorData.error
      
      setError(errorMessage || 'Error creating session. Please try again.')
      setLoading(false)
      return
    }

    const { token, user } = await sessionResponse.json()
    console.log('✅ Session created successfully!')

    Cookies.set('session_token', token, { expires: 30, secure: true, sameSite: 'strict' })

    onSuccess(token, user)

  } catch (error: any) {
    console.error('❌ Manual login error:', error)
    setError(`Unexpected error: ${error.message || 'Please try again.'}`)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-[#C89B3C]/20 to-neutral-900">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
          >
            ✕
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#C89B3C] flex items-center justify-center">
              <svg className="w-10 h-10 text-neutral-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Login to League Roulette
            </h2>
            <p className="text-neutral-400 text-sm">
              Choose your preferred login method
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Choose Mode */}
          {mode === 'choose' && (
            <div className="space-y-4">
              {/* OAuth Option (Recommended) */}
              <button
                onClick={() => setMode('oauth')}
                className="w-full p-5 rounded-xl bg-gradient-to-br from-red-600/20 to-neutral-900 border-2 border-red-500/30 hover:border-red-500/50 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">Riot OAuth</h3>
                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm">Secure, automatic verification</p>
                  </div>
                  <svg className="w-5 h-5 text-neutral-500 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Manual Option */}
              <button
                onClick={() => setMode('manual')}
                className="w-full p-5 rounded-xl bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-bold mb-1">Manual Riot ID</h3>
                    <p className="text-neutral-400 text-sm">Enter GameName#TAG</p>
                  </div>
                  <svg className="w-5 h-5 text-neutral-500 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <p className="text-blue-300 text-xs">
                  <strong>OAuth:</strong> You login on Riot's website - we never see your password<br/>
                  <strong>Manual:</strong> We verify your public Riot ID - no password needed
                </p>
              </div>
            </div>
          )}

          {/* OAuth Mode */}
          {mode === 'oauth' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('choose')}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition text-sm mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>

              {/* Trust Indicators */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-green-400 font-semibold text-sm mb-1">Official Riot Authentication</p>
                    <p className="text-green-300/80 text-xs">Login on auth.riotgames.com - Riot's official page</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-blue-400 font-semibold text-sm mb-1">We Never See Your Password</p>
                    <p className="text-blue-300/80 text-xs">Entered only on Riot's website, never on ours</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOAuthLogin}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold transition-all transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                  <span>Continue with Riot OAuth</span>
                </div>
              </button>
            </div>
          )}

          {/* Manual Mode */}
          {mode === 'manual' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('choose')}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition text-sm mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>

              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Riot ID
                </label>
                <input
                  type="text"
                  placeholder="GameName#TAG (e.g., Faker#KR1)"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#C89B3C] transition"
                />
                <p className="text-neutral-500 text-xs mt-2">
                  Find your Riot ID in-game or on your Riot account page
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-[#C89B3C] transition"
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
                onClick={handleManualLogin}
                disabled={loading || !riotId.includes('#')}
                className="w-full py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  'Login with Riot ID'
                )}
              </button>

              {/* Info */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-300 text-xs mb-1">
                      <strong>How this works:</strong>
                    </p>
                    <p className="text-blue-300/80 text-xs">
                      We use Riot's public API to verify your Riot ID exists and get your account info. No password required - this only accesses publicly available data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}