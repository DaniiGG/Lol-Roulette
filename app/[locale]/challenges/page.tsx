import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import ChallengesClient from './ChallengesClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('challenges')
  return {
    title: t('sectionTitle'),
    description: t('sectionDescription'),
    alternates: {
      canonical: locale === 'en' ? '/challenges' : `/${locale}/challenges`,
      languages: getHreflangAlternates('/challenges'),
    },
    openGraph: {
      title: t('sectionTitle'),
      description: t('sectionDescription'),
      url: locale === 'en' ? '/challenges' : `/${locale}/challenges`,
      siteName: 'League Roulette',
    },
  }
}

export default async function ChallengesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ChallengesClient />
}