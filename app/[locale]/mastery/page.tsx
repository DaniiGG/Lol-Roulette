"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { motion } from "framer-motion"
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
          <div className="relative">
            <div className="w-14 h-14 border-[3px] border-[#C89B3C]/20 border-t-[#C89B3C] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-r-[#00e5ff]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
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
        <div className="relative z-10 min-h-screen p-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md w-full text-center p-10 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md"
          >
            <div className="text-7xl mb-6 animate-float">🏅</div>
            <h1 className="text-3xl font-black text-white mb-3">{t('loginRequired')}</h1>
            <p className="text-neutral-400 mb-8">{t('loginRequiredDesc')}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLoginModalOpen(true)}
              className="px-8 py-4 rounded-xl bg-white text-neutral-950 font-bold hover:bg-neutral-100 transition cursor-pointer"
            >
              {t('signIn')}
            </motion.button>
          </motion.div>
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
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-[#C89B3C]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neutral-700/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
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
              <ChampionMastery puuid={user.puuid} region={user.region} />
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
