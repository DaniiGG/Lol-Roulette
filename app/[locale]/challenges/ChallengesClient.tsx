"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getChallengeSessions } from "@/lib/api-client"
import ChallengesSection from "@/components/ChallengesSection"
import Cookies from "js-cookie"
import { AlertTriangle } from "lucide-react"

export default function ChallengesClient() {
  const t = useTranslations('challenges')
  const locale = useLocale()
  const [user, setUser] = useState<any>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  useEffect(() => {
    const token = Cookies.get('session_token')
    if (token) {
      setSessionToken(token)
      verifyAndLoadSession(token)
    }
  }, [])

  const verifyAndLoadSession = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        Cookies.remove('session_token')
        return
      }

      const { user: userData } = await response.json()
      setUser(userData)
    } catch (error) {
      Cookies.remove('session_token')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/${locale}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span> {t('back') || 'Back'}
        </Link>

        <div role="status" className="mb-8 flex items-start gap-3 border border-amber-400/40 bg-amber-400/10 px-4 py-4 text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
          <div>
            <p className="font-semibold">{t('developmentNoticeTitle')}</p>
            <p className="mt-1 text-sm leading-6 text-amber-100/80">{t('developmentNoticeDescription')}</p>
          </div>
        </div>

        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">
            {t('sectionLabel') || 'Challenges'}
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {t('sectionTitle') || 'Challenges'}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-neutral-300">
            {t('sectionDescription') || 'Activate time-limited challenges to earn bonus XP on victories'}
          </p>
        </div>

        <ChallengesSection 
          user={user} 
          sessionToken={sessionToken} 
        />
      </div>
    </main>
  )
}