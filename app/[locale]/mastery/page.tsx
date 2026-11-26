"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import Cookies from 'js-cookie'
import { Award, ChartNoAxesCombined, ShieldCheck, Target, Trophy } from 'lucide-react'
import MasteryTreeExplorer from '@/components/mastery-tree/MasteryTreeExplorer'
import ChampionWinrate from '@/components/ChampionWinrate'
import HybridLoginModal from '@/components/RSOLoginmodal'
import Breadcrumbs from '@/components/Breadcrumbs'
import { championIconUrl } from '@/lib/champion-data'
import styles from '@/components/MasteryPage.module.css'

type MasteryUser = { puuid?: string; region?: string }
const PREVIEW_CHAMPIONS = [
  { id:'Ahri', x:50, y:10 }, { id:'Yasuo', x:80, y:23 },
  { id:'Lux', x:88, y:57 }, { id:'Thresh', x:70, y:86 },
  { id:'Jinx', x:30, y:86 }, { id:'Vladimir', x:12, y:57 },
  { id:'Riven', x:20, y:23 },
]

export default function MasteryPage() {
  const t = useTranslations('mastery')
  const tm = useTranslations('championMastery')
  const ui = useTranslations('mastery-page')
  const locale = useLocale()
  const [user, setUser] = useState<MasteryUser | null>(null)
  const [loading, setLoading] = useState(true)
  const hasProfile = Boolean(user?.puuid && user.region)

  useEffect(() => {
    const controller = new AbortController()
    async function checkSession() {
      const token = Cookies.get('session_token')
      if (!token) { setLoading(false); return }
      try {
        const response = await fetch('/api/auth/verify-session', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, signal:controller.signal })
        if (!response.ok) { Cookies.remove('session_token'); return }
        const data = await response.json() as { user: MasteryUser }
        if (!controller.signal.aborted) setUser(data.user)
      } catch {
        // Keep a valid session cookie when the network is temporarily unavailable.
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void checkSession()
    return () => controller.abort()
  }, [locale])

  function connected(token: string, data: MasteryUser) {
    Cookies.set('session_token', token, { expires:30, secure:true, sameSite:'strict' })
    setUser(data)
  }

  return <main className={`${styles.page} ${hasProfile ? styles.compact : ''}`}><div className={styles.wrap}>
    {!hasProfile && <Breadcrumbs items={[{label:'League Roulette',href:'/'},{label:t('title')}]} />}
    <header className={styles.header}>
      <div>
        {!hasProfile && <p className={styles.eyebrow}><Award size={14} aria-hidden="true" />{ui('eyebrow')}</p>}
        <h1 className={styles.title}>{t('title')}</h1>
        {!hasProfile && <p className={styles.intro}>{ui('intro')}</p>}
      </div>
      {hasProfile && <div className={styles.jumpLinks}>
        <span className={styles.badge}><ShieldCheck size={14} aria-hidden="true" />{ui('connected')}</span>
        <a href="#mastery-results"><ChartNoAxesCombined size={14} aria-hidden="true" />{t('winrateSection')}</a>
      </div>}
    </header>
    {!user ? <div className={styles.guest}>
      <div><div className={styles.visual} role="img" aria-label={ui('preview')}>
        <div className={styles.center}><Award size={34} strokeWidth={1.3} aria-hidden="true" /><span>{ui('collection')}</span></div>
        {PREVIEW_CHAMPIONS.map(champion => <Image key={champion.id} src={championIconUrl(champion.id)} alt="" width={56} height={56} className={styles.avatar} style={{left:`${champion.x}%`,top:`${champion.y}%`}} />)}
        <span className={styles.previewLabel}>{ui('preview')}</span>
      </div><div className={styles.features}>{[
        {Icon:Target,title:tm('totalPoints'),description:ui('pointsDesc')},
        {Icon:Trophy,title:tm('levelDistribution'),description:ui('levelsDesc')},
        {Icon:ChartNoAxesCombined,title:t('winrateSection'),description:ui('winsDesc')},
      ].map(({Icon,title,description}) => <section key={title} className={styles.feature}><Icon className={styles.featureIcon} aria-hidden="true" /><div><h2>{title}</h2><p>{description}</p></div></section>)}</div></div>
      <section className={styles.login} aria-label={t('signIn')}>
        {loading && <p className="sr-only" role="status">{ui('loading')}</p>}
        <fieldset disabled={loading} className="min-w-0">
          <HybridLoginModal variant="inline" initialMode="manual" onClose={() => {}} onSuccess={connected} />
        </fieldset>
      </section>
    </div> : user.puuid && user.region ? <>
      <section id="mastery-map" aria-labelledby="mastery-map-title"><h2 id="mastery-map-title" className="sr-only">{ui('tree')}</h2><MasteryTreeExplorer key={`${user.region}:${user.puuid}`} readOnlyMastery embedded riotProfile={{ puuid: user.puuid, region: user.region }} /></section>
      <section id="mastery-results" className={styles.section} aria-labelledby="mastery-results-title"><div className={styles.sectionHeader}><ChartNoAxesCombined className={styles.sectionIcon} aria-hidden="true" /><div><h2 id="mastery-results-title">{t('winrateSection')}</h2><p>{ui('resultsDesc')}</p></div></div><div className={styles.results}><ChampionWinrate puuid={user.puuid} region={user.region} /></div></section>
    </> : <section className={styles.notice}><h2>{ui('incomplete')}</h2><p>{ui('incompleteDesc')}</p><button type="button" className={styles.button} onClick={() => setUser(null)}>{ui('reconnect')}</button></section>}
  </div></main>
}
