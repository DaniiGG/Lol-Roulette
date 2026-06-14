'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface ChampionStatsProps {
  championId: string
  championName: string
}

const DDV = '16.12.1'

// Mapeo básico de builds por clase de campeón
const CLASS_BUILDS: Record<string, { items: string[], role: string }> = {
  Fighter: {
    role: 'Fighter / Bruiser',
    items: ['Trinity Force / Goredrinker', 'Black Cleaver', 'Sterak\'s Gage', 'Death\'s Dance', 'Guardian Angel', 'Plated Steelcaps / Mercury\'s Treads']
  },
  Tank: {
    role: 'Tank',
    items: ['Heartsteel / Jak\'Sho', 'Sunfire Aegis', 'Thornmail', 'Force of Nature', 'Gargoyle Stoneplate', 'Plated Steelcaps / Mercury\'s Treads']
  },
  Mage: {
    role: 'Mage / AP Carry',
    items: ['Luden\'s Echo / Liandry\'s Anguish', 'Shadowflame', 'Zhonya\'s Hourglass', 'Rabadon\'s Deathcap', 'Void Staff', 'Sorcerer\'s Shoes']
  },
  Assassin: {
    role: 'Assassin',
    items: ['Duskblade / Youmuu\'s Ghostblade', 'Axiom Arc', 'Edge of Night', 'Serylda\'s Grudge', 'Guardian Angel', 'Ionian Boots of Lucidity']
  },
  Marksman: {
    role: 'Marksman / ADC',
    items: ['Kraken Slayer / Galeforce', 'Infinity Edge', 'Rapid Firecannon', 'Lord Dominik\'s Regards', 'Bloodthirster', 'Berserker\'s Greaves']
  },
  Support: {
    role: 'Support',
    items: ['Locket of the Iron Solari / Shurelya\'s Battlesong', 'Redemption', 'Mikael\'s Blessing', 'Ardent Censer', 'Knight\'s Vow', 'Ionian Boots / Mobility Boots']
  }
}

export default function ChampionStats({ championId, championName }: ChampionStatsProps) {
  const t = useTranslations('championStats')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!championId) return

    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDV}/data/en_US/champion/${championId}.json`)
        const data = await res.json()
        setStats(data.data[championId])
      } catch (err) {
        console.error('Error fetching champion stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [championId])

  if (loading || !stats) {
    return (
      <div className="w-full mt-6 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-[#C89B3C]/30 border-t-[#C89B3C] rounded-full animate-spin"></div>
      </div>
    )
  }

  // Determine primary class build
  const primaryTag = stats.tags && stats.tags.length > 0 ? stats.tags[0] : 'Fighter'
  const recommendedBuild = CLASS_BUILDS[primaryTag] || CLASS_BUILDS['Fighter']

  return (
    <div className="w-full mt-6 space-y-6 animate-fadeIn">
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <span className="text-[#C89B3C]">{t('statistics', { champion: championName })}</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800/50">
            <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{t('health')}</p>
            <p className="text-xl font-medium text-emerald-400">{stats.stats.hp} <span className="text-sm text-neutral-500">+{stats.stats.hpperlevel}{t('perLevel')}</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800/50">
            <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{t('attackDamage')}</p>
            <p className="text-xl font-medium text-orange-400">{stats.stats.attackdamage} <span className="text-sm text-neutral-500">+{stats.stats.attackdamageperlevel}{t('perLevel')}</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800/50">
            <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{t('armor')}</p>
            <p className="text-xl font-medium text-yellow-500">{stats.stats.armor} <span className="text-sm text-neutral-500">+{stats.stats.armorperlevel}{t('perLevel')}</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800/50">
            <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{t('magicResist')}</p>
            <p className="text-xl font-medium text-blue-400">{stats.stats.spellblock} <span className="text-sm text-neutral-500">+{stats.stats.spellblockperlevel}{t('perLevel')}</span></p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {stats.tags.map((tag: string) => (
            <span key={tag} className="px-3 py-1 text-xs uppercase tracking-widest text-[#C89B3C] bg-[#C89B3C]/10 border border-[#C89B3C]/20 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
          <span className="text-blue-500">{t('recommendedBuild')}</span>
        </h3>
        <p className="text-neutral-400 text-sm mb-6">{t('buildForRole', { role: recommendedBuild.role })}</p>

        <div className="flex flex-wrap gap-3">
          {recommendedBuild.items.map((item: string, i: number) => (
            <div key={i} className="px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-neutral-200 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}