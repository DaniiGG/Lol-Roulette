import Link from 'next/link'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { CalendarDays, Gem, Sparkles, ArrowUpRight } from 'lucide-react'
import SkinShell, { SkinSchema } from '@/components/skins/SkinShell'
import { isSkinLocale } from '@/lib/skins/data'
import { skinCopy } from '@/lib/skins/copy'
import { skinBase, skinBreadcrumbSchema, skinMetadata } from '@/lib/skins/seo'
import styles from '@/components/skins/Skins.module.css'

type Props = { params: Promise<{ locale: string }> }
export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  if (!isSkinLocale(locale)) return { robots: { index:false, follow:true } }
  const t = skinCopy[locale]
  return skinMetadata({ locale, path:'/skins/shop', title:`${t.shopTitle} | League Roulette`, description:t.shopIntro })
}
export default async function ShopPage({ params }: Props) {
  const { locale } = await params
  if (!isSkinLocale(locale)) notFound()
  setRequestLocale(locale)
  const t = skinCopy[locale]
  return <SkinShell locale={locale} crumbs={[{name:t.shop}]}>
    <SkinSchema value={skinBreadcrumbSchema(locale,[{name:'Skins',path:skinBase(locale)},{name:t.shop,path:`${skinBase(locale)}/shop`}])} />
    <header className="max-w-3xl py-8"><p className={styles.eyebrow}>LEAGUE OF LEGENDS / {t.shop}</p><h1 className={styles.title}>{t.shopTitle}</h1><p className={styles.intro}>{t.shopIntro}</p></header>
    <div className={styles.shopGrid}>{[[CalendarDays,t.weekly,t.weeklyText],[Gem,t.mythic,t.mythicText],[Sparkles,t.personal,t.personalText]].map(([Icon,title,text]) => { const Symbol = Icon as typeof CalendarDays; return <section key={String(title)} className={styles.shopCard}><Symbol size={26} className="text-[#d7b576]" aria-hidden="true" /><h2>{String(title)}</h2><p className={styles.prose}>{String(text)}</p></section> })}</div>
    <p className={styles.prose}>{t.shopNote}</p>
    <section className={styles.editorial}><div><h2>{locale === 'es' ? 'Antes de comprar una skin' : 'Before buying a skin'}</h2><p>{locale === 'es' ? 'Compara la ilustración y la categoría del aspecto, y revisa su ficha para saber si tiene chromas o está marcado como legado. Los descuentos no cambian su rareza. La información del catálogo es una referencia visual; el importe final y la posibilidad de comprar se comprueban siempre en el cliente, en tu región y cuenta.' : 'Compare the artwork and category, and check the profile for chroma and legacy information. Discounts do not change rarity. The catalogue is a visual reference; always confirm the final price and purchase availability in the client for your region and account.'}</p><Link href={skinBase(locale)} className={styles.cta} style={{marginTop:20}}>{t.back}<ArrowUpRight size={14} /></Link></div><div><h2>{locale === 'es' ? 'Las ofertas de tu cuenta' : 'Account-specific offers'}</h2><p>{locale === 'es' ? 'No necesitas conectar tu cuenta para usar esta galería. Tus favoritas se guardan únicamente en el navegador. Ver un aspecto aquí no indica que lo tengas comprado o que forme parte de Tu tienda. Para consultar promociones personales, abre League of Legends con tu cuenta.' : 'You do not need to connect an account to use the gallery. Favorites are stored only in your browser. Seeing a skin here does not mean you own it or that it is part of Your Shop. Open League of Legends with your account to check personal promotions.'}</p><p style={{marginTop:16}}><a className={styles.cta} href="https://www.leagueoflegends.com/en-us/news/game-updates/" target="_blank" rel="noopener noreferrer">{locale === 'es' ? 'Novedades oficiales de Riot' : 'Official Riot updates'}<ArrowUpRight size={14} /></a></p></div></section>
  </SkinShell>
}
