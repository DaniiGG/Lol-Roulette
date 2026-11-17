import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import SkinShell, { SkinSchema } from '@/components/skins/SkinShell'
import SkinGallery from '@/components/skins/SkinGallery'
import { skinCatalog, isSkinLocale, skinCard, skinSplash } from '@/lib/skins/data'
import { skinCopy } from '@/lib/skins/copy'
import { skinBase, skinMetadata } from '@/lib/skins/seo'
import { SITE_URL } from '@/lib/site'
import styles from '@/components/skins/Skins.module.css'

type Props = { params: Promise<{ locale: string }> }
export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  if (!isSkinLocale(locale)) return { robots: { index: false, follow: true } }
  const t = skinCopy[locale]
  return skinMetadata({ locale, path: '/skins', title: `${locale === 'es' ? 'Skins de LoL: catálogo por campeón' : 'LoL Skins: Browse Every Champion'} | League Roulette`, description: t.meta })
}
export default async function SkinsPage({ params }: Props) {
  const { locale } = await params
  if (!isSkinLocale(locale)) notFound()
  setRequestLocale(locale)
  const t = skinCopy[locale]
  const featured = skinCatalog.skins.find(skin => skin.name.en === 'Spirit Blossom Ahri') ?? skinCatalog.skins[0]
  const collectionCount = new Set(skinCatalog.skins.flatMap(skin => skin.lines.map(line => line.id))).size
  return <SkinShell locale={locale}>
    <SkinSchema value={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.title, description: t.meta, url: `${SITE_URL}${skinBase(locale)}`, inLanguage: locale, mainEntity: { '@type': 'ItemList', numberOfItems: skinCatalog.champions.length, itemListElement: skinCatalog.champions.map((champion, index) => ({ '@type': 'ListItem', position: index + 1, name: champion.name[locale], url: `${SITE_URL}${skinBase(locale)}/${champion.slug}` })) } }} />
    <header className={styles.hero}>
      <Image src={skinSplash(featured)} alt={featured.name[locale]} fill priority sizes="(max-width: 1200px) 100vw, 1200px" className={styles.heroArt} />
      <div className={styles.heroContent}><p className={styles.eyebrow}>✦ {t.label} / {skinCatalog.patch}</p><h1 className={styles.title}>{t.title}</h1><p className={styles.intro}>{t.intro}</p><div className={styles.heroBottom}><a href="#catalogue" className={styles.cta}>{t.heroLink}<ArrowDown size={14} /></a><Link href={`${skinBase(locale)}/${featured.champion}/${featured.slug}`} className={styles.cta}>{featured.name[locale]}<ArrowUpRight size={14} /></Link></div></div>
      <span className={styles.artLabel}>{featured.name[locale]} · Riot Games</span>
    </header>
    <div className={styles.stats}>{[[skinCatalog.champions.length, t.champions], [skinCatalog.skins.length, t.skins], [collectionCount, t.collections]].map(([count,label]) => <div key={label} className={styles.stat}><strong>{Number(count).toLocaleString(locale)}</strong><span>{label}</span></div>)}</div>
    <SkinGallery locale={locale} champions={skinCatalog.champions} skins={skinCatalog.skins.map(skinCard)} version={skinCatalog.version} />
    <section className={styles.editorial}><div><p className={styles.eyebrow}>LEAGUE ROULETTE</p><h2>{t.browse}</h2><p>{locale === 'es' ? 'Empieza por tu campeón para comparar sus aspectos en una sola galería. Si buscas una estética concreta, usa el filtro de colección; para explorar aspectos épicos, legendarios o míticos, selecciona la rareza. Las estrellas de la colección son tus favoritas: guárdalas con el corazón y vuelve a verlas sin registrarte.' : 'Start with your champion to compare their appearances in one gallery. Use the collection filter for a particular aesthetic, or select a rarity to browse epic, legendary and mythic skins. Save the ones you like with the heart button and revisit your favorites without signing up.'}</p></div><div><h2>{t.faqTitle}</h2>{t.faqs.map(([q,a]) => <details key={q} className={styles.faq}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
  </SkinShell>
}
