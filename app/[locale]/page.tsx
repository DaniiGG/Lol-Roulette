import type { Metadata } from "next"
import { setRequestLocale } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import HomeClient from './HomeClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const metadataByLocale: Record<string, { title: string; description: string }> = {
    en: {
      title: 'Free LoL Random Champion Generator | League Roulette',
      description:
        'Pick a random League of Legends champion with a free champion roulette. Filter by lane, spin again, and start your next game instantly, no account required.',
    },
    es: {
      title: 'Ruleta y Generador Aleatorio de Campeones LoL | League Roulette',
      description:
        'Elige un campeón aleatorio de League of Legends gratis. Filtra por línea, gira la ruleta y descubre con quién jugar tu próxima partida.',
    },
  }
  const pageMetadata = metadataByLocale[locale] ?? metadataByLocale.en

  return {
    title: pageMetadata.title,
    description: pageMetadata.description,
    openGraph: {
      title: pageMetadata.title,
      description: pageMetadata.description,
    },
    twitter: {
      title: pageMetadata.title,
      description: pageMetadata.description,
    },
    alternates: {
      canonical: locale === 'en' ? '/' : `/${locale}`,
      languages: getHreflangAlternates('/'),
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <HomeClient />
}
