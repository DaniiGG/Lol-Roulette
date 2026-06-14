"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import Cookies from "js-cookie"
import ChampionMastery from "@/components/ChampionMastery"
import ChampionWinrate from "@/components/ChampionWinrate"
import HybridLoginModal from "@/components/RSOLoginmodal"

export default function MasteryPage() {
  const t = useTranslations('mastery')
  const locale = useLocale()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const token = Cookies.get('session_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          Cookies.remove('session_token')
          setLoading(false)
          return
        }

        const { user: userData } = await response.json()
        setUser(userData)
      } catch (error) {
        Cookies.remove('session_token')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [locale])

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="relative z-10 min-h-screen p-6 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#C89B3C]/30 border-t-[#C89B3C] rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="relative z-10 min-h-screen p-6 flex items-center justify-center">
          <div className="max-w-md w-full text-center p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md">
            <div className="text-6xl mb-6">🏅</div>
            <h1 className="text-3xl font-bold text-white mb-3">{t('loginRequired')}</h1>
            <p className="text-neutral-400 mb-8">{t('loginRequiredDesc')}</p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="inline-block px-8 py-4 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition cursor-pointer"
            >
              {t('signIn')}
            </button>
          </div>
        </div>

        {loginModalOpen && (
          <HybridLoginModal
            onClose={() => setLoginModalOpen(false)}
            onSuccess={(token: string, userData: any) => {
              Cookies.set('session_token', token, { expires: 30, secure: true, sameSite: 'strict' })
              setUser(userData)
              setLoginModalOpen(false)
            }}
          />
        )}
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  {t('title')}
                </h1>
                <p className="text-neutral-400 mt-2">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {user && user.puuid && user.region && (
              <ChampionMastery puuid={user.puuid} region={user.region} />
            )}

            {user && user.puuid && user.region && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">{t('winrateSection')}</h2>
                <ChampionWinrate puuid={user.puuid} region={user.region} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}