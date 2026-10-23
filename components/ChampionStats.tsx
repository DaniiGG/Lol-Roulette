'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface ChampionStatsProps {
  championId: string
  championName: string
}

interface ChampionStaticData {
  tags?: string[]
  partype?: string
  info?: {
    attack?: number
    defense?: number
    magic?: number
  }
}

interface DDragonItem {
  name: string
  maps?: Record<string, boolean>
}

const DDV = '16.21.1'

type Archetype =
  | 'ad_bruiser'
  | 'ap_bruiser'
  | 'tank'
  | 'ap_mage'
  | 'ap_assassin'
  | 'ad_assassin'
  | 'crit_marksman'
  | 'on_hit_marksman'
  | 'ap_marksman'
  | 'enchanter'
  | 'tank_support'

const BUILDS: Record<Archetype, { role: string; items: string[] }> = {
  ad_bruiser: {
    role: 'Fighter / Bruiser (AD)',
    items: ['Trinity Force', 'Black Cleaver', "Sterak's Gage", "Death's Dance", 'Guardian Angel', 'Plated Steelcaps'],
  },
  ap_bruiser: {
    role: 'Fighter / Bruiser (AP)',
    items: ['Riftmaker', "Liandry's Torment", 'Cosmic Drive', "Rylai's Crystal Scepter", "Zhonya's Hourglass", "Sorcerer's Shoes"],
  },
  tank: {
    role: 'Tank',
    items: ['Heartsteel', 'Sunfire Aegis', 'Thornmail', 'Force of Nature', "Jak'Sho, The Protean", 'Plated Steelcaps'],
  },
  ap_mage: {
    role: 'Mage / AP Carry',
    items: ["Luden's Echo", 'Shadowflame', "Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff', "Sorcerer's Shoes"],
  },
  ap_assassin: {
    role: 'Assassin (AP)',
    items: ['Hextech Rocketbelt', 'Shadowflame', "Zhonya's Hourglass", "Rabadon's Deathcap", 'Void Staff', "Sorcerer's Shoes"],
  },
  ad_assassin: {
    role: 'Assassin (AD)',
    items: ['Profane Hydra', 'Axiom Arc', 'Edge of Night', "Serylda's Grudge", 'Guardian Angel', 'Ionian Boots of Lucidity'],
  },
  crit_marksman: {
    role: 'Marksman / ADC',
    items: ['Kraken Slayer', 'Infinity Edge', 'Rapid Firecannon', "Lord Dominik's Regards", 'Bloodthirster', "Berserker's Greaves"],
  },
  on_hit_marksman: {
    role: 'Marksman / On-hit',
    items: ["Guinsoo's Rageblade", 'Kraken Slayer', 'Blade of The Ruined King', 'Terminus', "Wit's End", "Berserker's Greaves"],
  },
  ap_marksman: {
    role: 'Marksman (AP)',
    items: ["Nashor's Tooth", "Liandry's Torment", 'Shadowflame', "Rabadon's Deathcap", 'Void Staff', "Sorcerer's Shoes"],
  },
  enchanter: {
    role: 'Support / Enchanter',
    items: ['Moonstone Renewer', 'Redemption', "Mikael's Blessing", 'Ardent Censer', 'Staff of Flowing Water', 'Ionian Boots of Lucidity'],
  },
  tank_support: {
    role: 'Support / Tank',
    items: ['Locket of the Iron Solari', "Knight's Vow", "Zeke's Convergence", 'Redemption', 'Thornmail', 'Ionian Boots of Lucidity'],
  },
}

const ENCHANTERS = new Set([
  'Janna', 'Soraka', 'Lulu', 'Nami', 'Sona', 'Karma', 'Seraphine',
  'Rakan', 'Yuumi', 'Renata', 'Milio', 'Ivern', 'Bard',
])

const MAGE_SUPPORTS = new Set([
  'Brand', 'Zyra', 'Xerath', 'Velkoz', 'Lux', 'Morgana', 'Swain',
  'Heimerdinger', 'Zilean',
])

const ARCHETYPE_OVERRIDES: Record<string, Archetype> = {
  Gwen: 'ap_bruiser',
  Vladimir: 'ap_bruiser',
  Pyke: 'ad_assassin',
  Qiyana: 'ad_assassin',
  Jayce: 'ad_assassin',
  Kayle: 'ap_marksman',
  Teemo: 'ap_marksman',
  Yasuo: 'crit_marksman',
  Yone: 'crit_marksman',
  Tryndamere: 'crit_marksman',
  Nilah: 'crit_marksman',
  MasterYi: 'on_hit_marksman',
  KogMaw: 'on_hit_marksman',
  Vayne: 'on_hit_marksman',
  Kaisa: 'on_hit_marksman',
  Belveth: 'on_hit_marksman',
  Amumu: 'tank',
  Zac: 'tank',
}

function chooseArchetype(champ: ChampionStaticData | null, championId: string): Archetype {
  const override = ARCHETYPE_OVERRIDES[championId]
  if (override) return override

  const tags: string[] = champ?.tags ?? []
  const info = champ?.info ?? {}
  const attack = Number(info.attack ?? 0)
  const magic = Number(info.magic ?? 0)
  const defense = Number(info.defense ?? 0)
  const primary = tags[0] ?? ''
  const isMarksman = tags.includes('Marksman')
  const isSupport = tags.includes('Support')
  const isTank = tags.includes('Tank')
  const isAssassin = tags.includes('Assassin')
  const isMage = tags.includes('Mage')
  const isAP = magic > attack + 1 || (magic > attack && (isMage || isAssassin))

  if (isMarksman) return isAP ? 'ap_marksman' : 'crit_marksman'

  if (isSupport) {
    if (ENCHANTERS.has(championId)) return 'enchanter'
    if (MAGE_SUPPORTS.has(championId)) return 'ap_mage'
    if (isAssassin && !isAP) return 'ad_assassin'
    if (primary === 'Mage' || isMage) return 'ap_mage'
    if (isTank || defense >= 6) return 'tank_support'
    return 'enchanter'
  }

  if (primary === 'Assassin') return isAP ? 'ap_assassin' : 'ad_assassin'
  if (primary === 'Mage') return 'ap_mage'
  if (primary === 'Fighter') return isAP ? 'ap_bruiser' : 'ad_bruiser'
  if (primary === 'Tank') return isAP ? 'ap_bruiser' : 'tank'

  if (isAssassin) return isAP ? 'ap_assassin' : 'ad_assassin'
  if (isMage) return 'ap_mage'
  if (isTank) return isAP ? 'ap_bruiser' : 'tank'
  return isAP ? 'ap_mage' : 'ad_bruiser'
}

export default function ChampionStats({ championId }: ChampionStatsProps) {
  const t = useTranslations('championStats')
  const [stats, setStats] = useState<ChampionStaticData | null>(null)
  const [loading, setLoading] = useState(true)
  const [itemMap, setItemMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!championId) return

    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDV}/data/en_US/champion/${championId}.json`)
        const data: { data: Record<string, ChampionStaticData> } = await res.json()
        setStats(data.data[championId])
      } catch (err) {
        console.error('Error fetching champion stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [championId])

  useEffect(() => {
    let cancelled = false
    fetch(`https://ddragon.leagueoflegends.com/cdn/${DDV}/data/en_US/item.json`)
      .then((res) => res.json())
      .then((data: { data: Record<string, DDragonItem> }) => {
        if (cancelled) return
        const map: Record<string, number> = {}
        Object.entries(data.data).forEach(([id, item]) => {
          if (item?.maps?.['11'] !== true) return
          const numericId = Number(id)
          const current = map[item.name]
          if (current === undefined || numericId < current) {
            map[item.name] = numericId
          }
        })
        setItemMap(map)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !stats) {
    return (
      <div className="w-full mt-6 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-[#C89B3C]/30 border-t-[#C89B3C] rounded-full animate-spin"></div>
      </div>
    )
  }

  const archetype = chooseArchetype(stats, championId)
  const baseBuild = BUILDS[archetype]
  const recommendedBuild = archetype === 'ap_mage' && stats.partype !== 'Mana'
    ? { ...baseBuild, items: ['Hextech Rocketbelt', ...baseBuild.items.slice(1)] }
    : baseBuild

  return (
    <div className="w-full mt-6 space-y-6 animate-fadeIn">
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
          <span className="text-blue-500">{t('recommendedBuild')}</span>
        </h3>
        <p className="text-neutral-400 text-sm mb-6">{t('buildForRole', { role: recommendedBuild.role })}</p>

        <div className="flex flex-wrap gap-3">
          {recommendedBuild.items.map((item: string, i: number) => {
            const itemId = itemMap[item]
            return (
              <div key={i} className="px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
                {itemId ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${DDV}/img/item/${itemId}.png`}
                    alt={item}
                    className="w-8 h-8 object-cover rounded border border-neutral-700"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded border border-neutral-700 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                )}
                <span className="text-neutral-200 text-sm">{item}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
