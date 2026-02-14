// app/auth/callback/page.tsx
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      // Obtener el código de autorización de la URL
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        setError(errorDescription || error)
        console.error('OAuth error:', error, errorDescription)
        setTimeout(() => router.push('/'), 3000)
        return
      }

      if (!code) {
        setError('No authorization code received')
        setTimeout(() => router.push('/'), 3000)
        return
      }

      try {
        setStatus('Exchanging authorization code...')
        console.log('🔑 Exchanging code for tokens...')

        // Intercambiar el código por tokens
        const response = await fetch('/api/auth/riot-oauth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to authenticate')
        }

        const { token, user } = await response.json()

        setStatus('Authentication successful! Redirecting...')
        console.log('✅ Authentication successful:', user.game_name)

        // Guardar el token en cookies
        Cookies.set('session_token', token, {
          expires: 30, // 30 días
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })

        // Redirigir a la página principal
        setTimeout(() => {
          router.push('/')
        }, 1000)

      } catch (err: any) {
        console.error('❌ Authentication error:', err)
        setError(err.message || 'Authentication failed')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-8">
        
        {error ? (
          // Error state
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-neutral-400 mb-4">{error}</p>
            <p className="text-neutral-500 text-sm">Redirecting to home...</p>
          </div>
        ) : (
          // Loading state
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg className="animate-spin w-full h-full text-[#C89B3C]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authenticating</h2>
            <p className="text-neutral-400">{status}</p>
            
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#C89B3C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#C89B3C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#C89B3C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}