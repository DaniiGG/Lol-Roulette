import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ArrowUpRight, Palette } from 'lucide-react'
import SkinShell, { SkinSchema } from '@/components/skins/SkinShell'
import FavoriteButton from '@/components/skins/FavoriteButton'
import { SkinCard } from '@/components/skins/SkinGallery'
import { SKIN_LOCALES, skinCatalog, championSkins, findSkin, findSkinChampion, isSkinLocale, skinCard, skinIsIndexable, skinSplash } from '@/lib/skins/data'
import { skinCopy } from '@/lib/skins/copy'
import { skinBase, skinBreadcrumbSchema, skinMetadata } from '@/lib/skins/seo'
import { SITE_URL } from '@/lib/site'
import styles from '@/components/skins/Skins.module.css'

type Props = { params: Promise<{ locale: string; champion: string; skin: string }> }
const plainText = (value: string) => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
// Build on demand and cache: avoid rendering thousands of detail pages at deploy time.
export const revalidate = 86400
export function generateStaticParams() { return [] }
export async function generateMetadata({ params }: Props) {
  const { locale, champion, skin: slug } = await params
  const skin = findSkin(champion, slug)
  if (!isSkinLocale(locale) || !skin) return { robots: { index: false, follow: true } }
  const name = findSkinChampion(champion)!.name[locale]
  return skinMetadata({ locale, path: '/skins/[champion]/[skin]', params: { champion, skin: slug }, title: `${skin.name[locale]}: ${locale === 'es' ? 'skin de' : 'LoL skin for'} ${name} | League Roulette`, description: locale === 'es' ? `Descubre ${skin.name.es}, una skin de ${name} en League of Legends. Mira su ilustración, historia, rareza, colección y datos sobre chromas y legado.` : `Explore ${skin.name.en}, a ${name} skin in League of Legends. View its splash art, story, rarity, collection, chroma information and legacy status.`, skin, index: skinIsIndexable(skin, locale), alternateLocales: SKIN_LOCALES.filter(language => skinIsIndexable(skin, language)) })
}
export default async function SkinPage({ params }: Props) {
  const { locale, champion: championSlug, skin: slug } = await params
  const skin = findSkin(championSlug, slug), champion = findSkinChampion(championSlug)
  if (!isSkinLocale(locale) || !skin || !champion) notFound()
  setRequestLocale(locale)
  const t = skinCopy[locale], name = skin.name[locale], base = skinBase(locale)
  const rarity = t.rarities[skin.rarity as keyof typeof t.rarities] ?? skin.rarity
  const description = plainText(skin.description[locale])
  const related = championSkins(championSlug).filter(item => item.id !== skin.id).slice(-6)
  return <SkinShell locale={locale} crumbs={[{ name: champion.name[locale], href: `${base}/${championSlug}` }, { name }]}>
    <SkinSchema value={skinBreadcrumbSchema(locale, [{ name: 'Skins', path: base }, { name: champion.name[locale], path: `${base}/${championSlug}` }, { name, path: `${base}/${championSlug}/${slug}` }])} />
    <SkinSchema value={{ '@context': 'https://schema.org', '@type': 'ImageObject', name, description: description || `${name} — League of Legends`, contentUrl: skinSplash(skin), url: `${SITE_URL}${base}/${championSlug}/${slug}`, creator: { '@type': 'Organization', name: 'Riot Games' }, creditText: 'Riot Games', copyrightNotice: '© Riot Games', inLanguage: locale }} />
    <header className={styles.detailHeader}><div><p className={styles.eyebrow}>{champion.name[locale]} / {rarity}</p><h1>{name}</h1></div><Link className={styles.cta} href={`${base}/${championSlug}`}>{t.championTitle(champion.name[locale])}<ArrowUpRight size={14} /></Link></header>
    <div className={styles.skinHero}><Image src={skinSplash(skin)} alt={`${name} — ${champion.name[locale]}, League of Legends`} fill priority sizes="(max-width: 1200px) 100vw, 1200px" /><FavoriteButton id={skin.id} locale={locale} /></div>
    <div className={styles.detailGrid}><section><p className={styles.eyebrow}><Palette size={14} aria-hidden="true" />{t.details}</p>{description && <><h2 className="mb-4 text-2xl font-medium">{t.story}</h2><p className={styles.prose}>{description}</p></>}<h2 className="mb-3 mt-8 text-lg font-medium">{t.availability}</h2><p className={styles.prose}>{skin.legacy ? t.legacyInfo : t.availabilityInfo}</p>{skin.preview && <a className={styles.cta} style={{ marginTop:20 }} href={skin.preview} target="_blank" rel="noopener noreferrer">{locale === 'es' ? 'Ver vídeo del aspecto' : 'Watch skin preview'}<ArrowUpRight size={14} /></a>}</section>
      <aside className={styles.facts} aria-label={t.details}><dl>
        <div className={styles.fact}><dt>{t.champions}</dt><dd><Link href={`${base}/${championSlug}`}>{champion.name[locale]}</Link></dd></div>
        <div className={styles.fact}><dt>{t.rarity}</dt><dd>{rarity}</dd></div>
        {skin.lines.length > 0 && <div className={styles.fact}><dt>{t.collection}</dt><dd>{skin.lines.map(line => line[locale]).join(' · ')}</dd></div>}
        <div className={styles.fact}><dt>{t.legacy}</dt><dd>{skin.legacy ? locale === 'es' ? 'Sí' : 'Yes' : 'No'}</dd></div>
        {skin.hasChromas !== null && <div className={styles.fact}><dt>Chromas</dt><dd>{skin.hasChromas ? locale === 'es' ? 'Sí' : 'Yes' : 'No'}</dd></div>}
        <div className={styles.fact}><dt>{t.updated}</dt><dd>{skinCatalog.patch}</dd></div>
      </dl><p className={styles.muted} style={{ lineHeight:1.8, marginTop:16 }}>{t.availabilityInfo}</p></aside>
    </div>
    <section><div className={styles.sectionHead}><h2>{t.more} {champion.name[locale]}</h2><Link href={`${base}/${championSlug}`} className={styles.muted}>{t.back} →</Link></div><div className={styles.grid}>{related.map(item => <SkinCard key={item.id} skin={skinCard(item)} champion={champion} locale={locale} />)}</div></section>
  </SkinShell>
}
