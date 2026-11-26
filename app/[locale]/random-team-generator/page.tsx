import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Link } from '@/i18n/navigation'
import { getRouletteChampions } from '@/lib/roulette-champions'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import TeamGenerator from './TeamGenerator'

const path = '/random-team-generator'
const copy = {
  en: {
    label: 'Team Generator',
    title: 'LoL Random Team Generator',
    description: 'Split 2 to 10 League of Legends players into two teams. Randomize roles and champions for a custom game, then share the lineup.',
    how: 'How does the team draw work?',
    details: 'Teams are balanced by player count. With an odd number of players, one team gets an extra player. Turn on roles to assign different positions within each team, or add champion picks with no duplicates across both teams.',
    roulette: 'Try the champion roulette',
  },
  es: {
    label: 'Generador de equipos',
    title: 'Generador de equipos aleatorios de LoL',
    description: 'Reparte de 2 a 10 jugadores de League of Legends en dos equipos. Sortea posiciones y campeones para una partida personalizada y comparte el resultado.',
    how: '¿Cómo funciona el sorteo de equipos?',
    details: 'El sorteo reparte a los jugadores por número. Si el total es impar, un equipo tendrá un jugador más. Activa las posiciones para asignar una distinta a cada persona del equipo o añade campeones sin repetir entre los dos equipos.',
    roulette: 'Prueba la ruleta de campeones',
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
  const { title, description } = copy[locale]
  return buildPageMetadata({ locale, path, title, description })
}

export default async function TeamGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await getLocale(params)
  const t = copy[locale]
  const champions = getRouletteChampions('all').map(({ id, name }) => ({ id, name: name[locale] }))

  return (
    <main className="min-h-screen bg-[#080b12] px-5 pb-20 pt-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs items={[{ label: 'League Roulette', href: '/' }, { label: t.label }]} />
        <header className="mb-8 mt-8 max-w-3xl">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">{t.description}</p>
        </header>
        <TeamGenerator locale={locale} champions={champions} />
        <section className="mt-12 max-w-2xl border-t border-white/10 pt-8">
          <h2 className="text-xl font-semibold">{t.how}</h2>
          <p className="mb-4 mt-2 leading-relaxed text-zinc-300">{t.details}</p>
          <Link href="/" prefetch={false} className="font-semibold text-cyan-300 underline underline-offset-4">
            {t.roulette}
          </Link>
        </section>
      </div>
    </main>
  )
}
