import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Link } from '@/i18n/navigation'
import championCatalog from '@/lib/roulette-champions.json'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import DuoRoulette from './DuoRoulette'
import { pairs } from './duos'

const path = '/bot-lane-duo-randomizer'
const copy = {
  en: {
    title: 'LoL Bot Lane Duo Randomizer',
    label: 'ADC + Support Duo Randomizer',
    intro: 'Roll an ADC and support to play with a friend in League of Legends. Pick a playstyle or let the roulette surprise you.',
    how: 'Which style should you pick?',
    details: 'Choose Aggressive to look for early fights, Safe to play around protection and scaling, or Unusual to try off-meta pairings. Unusual duos can include mages in the bot carry slot.',
    team: 'Randomize teams and roles for a custom game',
  },
  es: {
    title: 'Ruleta de dúos ADC + support de LoL',
    label: 'Ruleta de dúos ADC + support',
    intro: 'Sortea una pareja de ADC y support para jugar con un amigo en League of Legends. Elige un estilo o deja que la ruleta te sorprenda.',
    how: '¿Qué estilo te apetece jugar?',
    details: 'Elige Agresivo para buscar peleas pronto, Seguro para jugar con protección y escalar, o Raro para probar parejas fuera del meta. Los dúos raros pueden incluir magos en el puesto de ADC.',
    team: 'Sortear equipos y roles para una partida personalizada',
  },
}

async function getLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params
  if (locale !== 'en' && locale !== 'es') notFound()
  setRequestLocale(locale)
  return locale
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await getLocale(params)
  return buildPageMetadata({ locale, path, title: copy[locale].title, description: copy[locale].intro })
}

export default async function DuoPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await getLocale(params)
  const t = copy[locale]
  const ids = new Set<string>(pairs.flatMap(({ adc, support }) => [adc, support]))
  const names = Object.fromEntries(championCatalog.filter(champion => ids.has(champion.id))
    .map(({ id, name }) => [id, name[locale]]))

  return (
    <main className="min-h-screen bg-[#080b12] px-5 pb-20 pt-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs items={[{ label: 'League Roulette', href: '/' }, { label: t.label }]} />
        <header className="mb-8 mt-8 max-w-3xl">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">{t.intro}</p>
        </header>
        <DuoRoulette locale={locale} names={names} />
        <section className="mt-12 max-w-2xl border-t border-white/10 pt-8">
          <h2 className="text-xl font-semibold">{t.how}</h2>
          <p className="mb-4 mt-2 leading-relaxed text-zinc-300">{t.details}</p>
          <Link href="/random-team-generator" prefetch={false} className="font-semibold text-cyan-300 underline underline-offset-4">{t.team}</Link>
        </section>
      </div>
    </main>
  )
}
