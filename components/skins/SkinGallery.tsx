'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Heart, Search } from 'lucide-react'
import { skinCopy } from '@/lib/skins/copy'
import type { SkinCardData, SkinChampion, SkinLocale } from '@/lib/skins/data'
import FavoriteButton, { useSkinFavorites } from './FavoriteButton'
import styles from './Skins.module.css'

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const base = (locale: SkinLocale) => locale === 'es' ? '/es/skins' : '/skins'
export function SkinCard({ skin, champion, locale }: { skin: SkinCardData; champion: SkinChampion; locale: SkinLocale }) {
  const t = skinCopy[locale]
  const href = `${base(locale)}/${champion.slug}/${skin.slug}`
  return <article className={styles.card}>
    <FavoriteButton id={skin.id} locale={locale} />
    <Link href={href} aria-label={`${t.view}: ${skin.name[locale]}`}>
      <div className={styles.cardArt}>
        <Image src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`} alt={skin.name[locale]} fill sizes="(max-width: 700px) 46vw, 380px" className={styles.image} />
        <div className={styles.artFade} /><span className={styles.badge}>{t.rarities[skin.rarity as keyof typeof t.rarities] ?? skin.rarity}</span>
      </div>
      <div className={styles.cardBody}><p className={styles.cardMeta}>{champion.name[locale]}{skin.legacy ? ` · ${t.legacy}` : ''}</p><h3 className={styles.cardName}>{skin.name[locale]}</h3></div>
    </Link>
  </article>
}

export default function SkinGallery({ skins, champions, locale, version, championOnly = false }: { skins: SkinCardData[]; champions: SkinChampion[]; locale: SkinLocale; version: string; championOnly?: boolean }) {
  const t = skinCopy[locale]
  const [query, setQuery] = useState('')
  const [rarity, setRarity] = useState('all')
  const [collection, setCollection] = useState('all')
  const [favorites, setFavorites] = useState(false)
  const [mode, setMode] = useState<'champions' | 'skins'>(championOnly ? 'skins' : 'champions')
  const [limit, setLimit] = useState(36)
  const favoriteIds = useSkinFavorites()
  const championMap = useMemo(() => new Map(champions.map(champion => [champion.slug, champion])), [champions])
  const counts = useMemo(() => { const map = new Map<string, number>(); for (const skin of skins) map.set(skin.champion, (map.get(skin.champion) ?? 0) + 1); return map }, [skins])
  const collections = useMemo(() => [...new Map(skins.flatMap(skin => skin.lines.map(line => [line.id, line[locale]] as const))).entries()].sort((a,b) => a[1].localeCompare(b[1], locale)), [skins, locale])
  const search = normalize(query.trim())
  const showSkins = championOnly || mode === 'skins' || search !== '' || favorites || rarity !== 'all' || collection !== 'all'
  const results = skins.filter(skin => {
    const champion = championMap.get(skin.champion)
    return (!search || normalize(`${skin.name[locale]} ${champion?.name[locale]} ${skin.lines.map(line => line[locale]).join(' ')}`).includes(search)) &&
      (rarity === 'all' || skin.rarity === rarity) && (collection === 'all' || skin.lines.some(line => String(line.id) === collection)) && (!favorites || favoriteIds.includes(skin.id))
  })
  function clear() { setQuery(''); setRarity('all'); setCollection('all'); setFavorites(false); setLimit(36) }
  return <section id="catalogue">
    <div className={styles.tools}><div className={styles.toolRow}>
      <div className={styles.search}><Search size={16} className={styles.searchIcon} aria-hidden="true" /><input className={styles.input} type="search" aria-label={t.search} placeholder={t.search} value={query} onChange={event => { setQuery(event.target.value); setLimit(36) }} /></div>
      <select className={styles.select} aria-label={t.rarity} value={rarity} onChange={event => { setRarity(event.target.value); setLimit(36) }}><option value="all">{t.all}</option>{Object.entries(t.rarities).filter(([key]) => skins.some(skin => skin.rarity === key)).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select className={styles.select} aria-label={t.collection} value={collection} onChange={event => { setCollection(event.target.value); setLimit(36) }}><option value="all">{t.collections}</option>{collections.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
      <button type="button" aria-pressed={favorites} onClick={() => { setFavorites(value => !value); setLimit(36) }} className={styles.toggle + (favorites ? ' ' + styles.active : '')}><Heart size={14} aria-hidden="true" />{t.favorites}</button>
    </div></div>
    <div className={styles.sectionHead}><h2>{showSkins ? t.gallery : t.browse}</h2>{!championOnly && <div className={styles.toolRow}><button type="button" className={styles.toggle + (!showSkins ? ' ' + styles.active : '')} aria-pressed={!showSkins} onClick={() => { clear(); setMode('champions') }}>{t.champions}</button><button type="button" className={styles.toggle + (showSkins ? ' ' + styles.active : '')} aria-pressed={showSkins} onClick={() => setMode('skins')}>{t.skins}</button></div>}</div>
    <p className={styles.muted} role="status" style={{ marginBottom: 18 }}>{showSkins ? results.length : champions.length} {t.results}</p>
    {!showSkins ? <div className={styles.champions}>{champions.map(champion => <Link key={champion.id} href={`${base(locale)}/${champion.slug}`} className={styles.champion}>
      <Image src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.id}.png`} alt="" width={52} height={52} className={styles.championIcon} />
      <span><span className={styles.championName}>{champion.name[locale]}</span><span className={styles.championCount}>{counts.get(champion.slug) ?? 0} skins</span></span><ArrowUpRight size={14} className={styles.arrow} aria-hidden="true" />
    </Link>)}</div> : results.length ? <><div className={styles.grid}>{results.slice(0, championOnly ? results.length : limit).map(skin => <SkinCard key={skin.id} skin={skin} champion={championMap.get(skin.champion)!} locale={locale} />)}</div>{!championOnly && limit < results.length && <div className={styles.more}><button type="button" className={styles.cta} onClick={() => setLimit(value => value + 36)}>{t.showMore}</button></div>}</> : <div className={styles.empty}>{t.empty}<button type="button" onClick={clear}>{t.clear}</button></div>}
  </section>
}
