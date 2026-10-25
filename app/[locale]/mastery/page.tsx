"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import Cookies from "js-cookie"
import ChampionMasteryTree from "@/components/ChampionMasteryTree"
import ChampionWinrate from "@/components/ChampionWinrate"
import HybridLoginModal from "@/components/RSOLoginmodal"
import Breadcrumbs from "@/components/Breadcrumbs"

export default function MasteryPage() {
  const t = useTranslations('mastery')
  const tm = useTranslations('championMastery')
  const locale = useLocale()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        <div className="relative z-10 min-h-screen px-4 pb-4 pt-10 sm:px-6 sm:pb-6">
          <div className="mx-auto max-w-[1600px]">
            <Breadcrumbs
              items={[
                { label: 'League Roulette', href: '/' },
                { label: t('title') },
              ]}
            />
          </div>
          <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
            <div className="relative">
              <div className="w-14 h-14 border-[3px] border-[#C89B3C]/20 border-t-[#C89B3C] rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-r-[#00e5ff]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
          </div>
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

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-[12%] h-[420px] w-[420px] rounded-full bg-[#C89B3C]/15 blur-[130px]"></div>
          <div className="absolute bottom-[8%] left-[6%] h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
          <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]"></div>
        </div>

        <div className="relative z-10 min-h-screen px-4 pb-16 pt-8 sm:px-6">
          <div className="mx-auto max-w-[1600px]">
            <Breadcrumbs
              items={[
                { label: 'League Roulette', href: '/' },
                { label: t('title') },
              ]}
            />
          </div>

          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C89B3C]/30 bg-[#C89B3C]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f0c75e]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f0c75e]/70"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f0c75e]"></span>
                </span>
                {t('loginRequired')}
              </span>

              <h1
                className="mt-5 bg-gradient-to-r from-[#f0c75e] via-[#C89B3C] to-[#f0c75e] bg-clip-text text-5xl uppercase leading-[0.95] tracking-[0.04em] text-transparent sm:text-6xl lg:text-7xl"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {t('title')}
              </h1>

              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-400 lg:mx-0">
                {t('loginRequiredDesc')}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-neutral-300 backdrop-blur-sm">
                  <span className="text-[#f0c75e]">🎯</span>
                  {tm('totalPoints')}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-neutral-300 backdrop-blur-sm">
                  <span className="text-cyan-300">📈</span>
                  {t('winrateSection')}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-neutral-300 backdrop-blur-sm">
                  <span className="text-violet-300">⭐</span>
                  {tm('mastery7Plus')}
                </div>
              </div>

            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#C89B3C]/20 via-transparent to-cyan-400/10 blur-2xl"></div>
              <HybridLoginModal
                variant="inline"
                onClose={() => {}}
                onSuccess={(token: string, userData: any) => {
                  Cookies.set('session_token', token, { expires: 30, secure: true, sameSite: 'strict' })
                  setUser(userData)
                }}
                initialMode="manual"
              />
            </div>
          </div>
        </div>
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
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C89B3C]/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 min-h-screen px-4 pb-4 pt-10 sm:px-6 sm:pb-6">
        <div className="max-w-[1600px] mx-auto">
          <Breadcrumbs
            items={[
              { label: 'League Roulette', href: '/' },
              { label: t('title') },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
                  <span className="bg-gradient-to-r from-[#C89B3C] via-yellow-300 to-[#C89B3C] bg-clip-text text-transparent">
                    {t('title')}
                  </span>
                </h1>
                <p className="text-neutral-400 mt-3 text-lg font-light tracking-wide">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {user && user.puuid && user.region && (
              <ChampionMasteryTree puuid={user.puuid} region={user.region} />
            )}

            {user && user.puuid && user.region && (
              <div className="mt-16">
                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                  <span className="w-1 h-7 bg-gradient-to-b from-[#C89B3C] to-cyan-400 rounded-full"></span>
                  {t('winrateSection')}
                </h2>
                <ChampionWinrate puuid={user.puuid} region={user.region} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
