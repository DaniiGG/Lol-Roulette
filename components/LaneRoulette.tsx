'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ChampionGuideLink from '@/components/ChampionGuideLink'

type Champion = { id: string; name: string }
export default function LaneRoulette({ lane }: { lane: string }) {
  const t = useTranslations('championCard')
  const [champion, setChampion] = useState<Champion | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  async function spin() {
    if (loading) return
    setLoading(true)
    setFailed(false)
    try {
      const response = await fetch(`/api/roulette?lane=${encodeURIComponent(lane)}`)
      if (!response.ok) throw new Error('Roulette unavailable')
      const result: Champion = await response.json()
      if (!result.id || !result.name) throw new Error('Invalid champion')
      setChampion(result)
    } catch { setFailed(true) }
    finally { setLoading(false) }
  }
  return <section className="mb-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
    <div aria-live="polite" aria-busy={loading}>
      {champion && <h2 className="mb-4 text-3xl text-white">{champion.name}</h2>}
    </div>
    {failed && <p role="alert" className="mb-3 text-neutral-300">{t('readyToBegin')} {t('pressBelow')}</p>}
    <button onClick={spin} disabled={loading} className="rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950 disabled:opacity-50">
      {loading ? t('spinning') : champion ? t('spinAgain') : t('spinRoulette')}
    </button>
    {champion && <div className="mt-4"><ChampionGuideLink championId={champion.id} /></div>}
  </section>
}
