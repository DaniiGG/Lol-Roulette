import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import ChallengesClient from './ChallengesClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('page-seo')

  return buildPageMetadata({
    locale,
    path: '/challenges',
    title: t('challenges.title'),
    description: t('challenges.description'),
  })
}

export default async function ChallengesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ChallengesClient />
}