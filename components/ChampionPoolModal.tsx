'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { getChampionsByLane } from '@/lib/champion-lanes'
import { ChampionPool, loadChampionPool, saveChampionPool } from '@/lib/champion-pool'

const LANES = ['top', 'jungle', 'mid', 'adc', 'support']

interface ChampionPoolModalProps {
  onClose: () => void
  onSave: (pool: ChampionPool) => void
}

export default function ChampionPoolModal({ onClose, onSave }: ChampionPoolModalProps) {
  const t = useTranslations('championPool')
  const [pool, setPool] = useState<ChampionPool>({})
  const [activeLane, setActiveLane] = useState('top')
  const [champions, setChampions] = useState<string[]>([])

  useEffect(() => {
    setPool(loadChampionPool())
  }, [])

  useEffect(() => {
    setChampions(getChampionsByLane(activeLane))
  }, [activeLane])

  const toggleChampion = (champ: string) => {
    setPool(prev => {
      const current = prev[activeLane] || []
      const next = current.includes(champ)
        ? current.filter(c => c !== champ)
        : [...current, champ]
      return { ...prev, [activeLane]: next }
    })
  }

  const selectedCount = (pool[activeLane] || []).length
  const totalSelected = Object.values(pool).flat().length
  const oneLaneValid = LANES.some(l => (pool[l] || []).length >= 5)

  const handleSave = () => {
    saveChampionPool(pool)
    onSave(pool)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white text-xl">✕</button>
          </div>
          <p className="text-neutral-400 text-sm">{t('desc', { min: 5 })}</p>
        </div>

        <div className="flex gap-0 h-full">
          <div className="w-40 flex-shrink-0 border-r border-neutral-800 p-2 space-y-1">
            {LANES.map(lane => {
              const count = (pool[lane] || []).length
              const valid = count >= 5
              return (
                <button
                  key={lane}
                  onClick={() => setActiveLane(lane)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left transition flex items-center justify-between ${
                    activeLane === lane
                      ? 'bg-[#C89B3C]/20 border border-[#C89B3C]/40 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-sm font-medium capitalize">{lane}</span>
                  <span className={`text-xs ${valid ? 'text-green-400' : 'text-neutral-500'}`}>
                    {count}/5
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {champions.map(champ => {
                const selected = (pool[activeLane] || []).includes(champ)
                return (
                  <button
                    key={champ}
                    onClick={() => toggleChampion(champ)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition border ${
                      selected
                        ? 'bg-[#C89B3C]/20 border-[#C89B3C]/50 text-[#C89B3C]'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    {champ}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-sm text-neutral-400">
            {t('totalSelected', { count: totalSelected })}
            <span className="ml-2 text-neutral-600 text-xs">{t('minPerLane')}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-sm">
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!oneLaneValid}
              className="px-4 py-2 rounded-xl bg-[#C89B3C] text-neutral-950 font-semibold hover:bg-[#d9aa44] disabled:opacity-40 text-sm"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
