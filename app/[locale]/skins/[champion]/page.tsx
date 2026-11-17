import Image from 'next/image'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import SkinShell, { SkinSchema } from '@/components/skins/SkinShell'
import SkinGallery from '@/components/skins/SkinGallery'
import { skinCatalog, championSkins, findSkinChampion, isSkinLocale, skinCard, skinSplash } from '@/lib/skins/data'
import { skinCopy } from '@/lib/skins/copy'
import { skinBase, skinBreadcrumbSchema, skinMetadata } from '@/lib/skins/seo'
import { SITE_URL } from '@/lib/site'
import styles from '@/components/skins/Skins.module.css'

type Props = { params: Promise<{ locale: string; champion: string }> }
export const dynamicParams = true
export function generateStaticParams() { return ['en', 'es'].flatMap(locale => skinCatalog.champions.map(champion => ({ locale, champion: champion.slug }))) }
export async function generateMetadata({ params }: Props) {
  const { locale, champion: slug } = await params
  const champion = findSkinChampion(slug)
  if (!isSkinLocale(locale) || !champion) return { robots: { index: false, follow: true } }
  const skins = championSkins(slug), t = skinCopy[locale]
  return skinMetadata({ locale, path: '/skins/[champion]', params: { champion: slug }, title: `${t.championTitle(champion.name[locale])} | League Roulette`, description: t.championMeta(champion.name[locale], skins.length), skin: skins[skins.length - 1] })
}
export default async function ChampionSkinsPage({ params }: Props) {
  const { locale, champion: slug } = await params
  const champion = findSkinChampion(slug)
  if (!isSkinLocale(locale) || !champion) notFound()
  setRequestLocale(locale)
  const skins = championSkins(slug), t = skinCopy[locale], name = champion.name[locale]
  const featured = skins.filter(skin => ['legendary', 'ultimate', 'exalted', 'transcendent'].includes(skin.rarity)).at(-1) ?? skins.at(-1)
  if (!featured) notFound()
  const base = skinBase(locale)
  return <SkinShell locale={locale} crumbs={[{ name }]}>
    <SkinSchema value={skinBreadcrumbSchema(locale, [{ name: 'Skins', path: base }, { name, path: `${base}/${slug}` }])} />
    <SkinSchema value={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.championTitle(name), url: `${SITE_URL}${base}/${slug}`, inLanguage: locale, mainEntity: { '@type': 'ItemList', numberOfItems: skins.length, itemListElement: skins.map((skin,index) => ({ '@type': 'ListItem', position: index + 1, name: skin.name[locale], url: `${SITE_URL}${base}/${slug}/${skin.slug}` })) } }} />
    <header className={styles.hero}><Image src={skinSplash(featured)} alt={featured.name[locale]} fill priority sizes="(max-width: 1200px) 100vw, 1200px" className={styles.heroArt} /><div className={styles.heroContent}><p className={styles.eyebrow}>{name} / {champion.title[locale]}</p><h1 className={styles.title}>{t.championTitle(name)}</h1><p className={styles.intro}>{t.championIntro(name, skins.length)}</p><div className={styles.heroBottom}><span className={styles.cta}>{skins.length} skins</span><a className={styles.cta} href="#catalogue">{t.gallery} ↓</a></div></div><span className={styles.artLabel}>{featured.name[locale]}</span></header>
    <SkinGallery locale={locale} champions={[champion]} skins={skins.map(skinCard)} championOnly version={skinCatalog.version} />
    <section className={styles.editorial}><div><h2>{t.collections}</h2><p>{[...new Set(skins.flatMap(skin => skin.lines.map(line => line[locale])))].join(' · ')}</p></div><div><h2>{t.availability}</h2><p>{t.availabilityInfo}</p></div></section>
  </SkinShell>
}
