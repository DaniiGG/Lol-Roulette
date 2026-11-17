import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight, ArrowUpRight } from 'lucide-react'
import { skinCopy } from '@/lib/skins/copy'
import { skinCatalog, type SkinLocale } from '@/lib/skins/data'
import styles from './Skins.module.css'

export function SkinSchema({ value }: { value: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, '\\u003c') }} />
}
export function SkinSources({ locale }: { locale: SkinLocale }) {
  const t = skinCopy[locale]
  return <footer className={styles.sources}><p>{t.updated} <strong>{skinCatalog.patch}</strong> · {t.updatedDate}: <time dateTime={skinCatalog.updatedAt}>{skinCatalog.updatedAt}</time></p><p>{t.sourceInfo}</p><p><a href="https://developer.riotgames.com/docs/lol#data-dragon" target="_blank" rel="noopener noreferrer">Riot Data Dragon</a> · <a href={skinCatalog.sources[1]} target="_blank" rel="noopener noreferrer">CommunityDragon</a></p></footer>
}
export default function SkinShell({ locale, crumbs = [], children }: { locale: SkinLocale; crumbs?: { name: string; href?: string }[]; children: ReactNode }) {
  const base = locale === 'es' ? '/es' : ''
  return <main className={styles.page}><div className={styles.wrap}>
    <nav className={styles.crumbs} aria-label={locale === 'es' ? 'Ruta de navegación' : 'Breadcrumb'}><Link href={base || '/'}>League Roulette</Link><ChevronRight size={11} aria-hidden="true" />{crumbs.length ? <Link href={`${base}/skins`}>Skins</Link> : <span aria-current="page">Skins</span>}{crumbs.map((crumb, index) => <span key={crumb.name} className="inline-flex items-center gap-2"><ChevronRight size={11} aria-hidden="true" />{crumb.href && index !== crumbs.length - 1 ? <Link href={crumb.href}>{crumb.name}</Link> : <span aria-current={index === crumbs.length - 1 ? 'page' : undefined}>{crumb.name}</span>}</span>)}</nav>
    {children}
    <div className={styles.more}><Link className={styles.cta} href={`${base}/skins/shop`}>{skinCopy[locale].shop}<ArrowUpRight size={14} /></Link></div>
    <SkinSources locale={locale} />
  </div></main>
}
