'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ChampionGuideLink from '@/components/ChampionGuideLink'
import { championIconUrl } from '@/lib/champion-data'

type Champion = { id: string; name: string }
export default function LaneRoulette({ champions }: { champions: Champion[] }) {
  const t = useTranslations('championCard')
  const [champion, setChampion] = useState<Champion | null>(null)
  function spin() {
    setChampion(champions[Math.floor(Math.random() * champions.length)])
  }
  return <section className="mb-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
    <div aria-live="polite">
      {champion && <div className="mb-4 flex items-center gap-3">
        <img src={championIconUrl(champion.id)} alt="" width={48} height={48} className="rounded" />
        <h2 className="text-3xl text-white">{champion.name}</h2>
      </div>}
    </div>
    <button onClick={spin} className="rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950">
      {champion ? t('spinAgain') : t('spinRoulette')}
    </button>
    {champion && <div className="mt-4"><ChampionGuideLink championId={champion.id} /></div>}
  </section>
}
