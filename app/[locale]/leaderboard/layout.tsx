import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/seo/page-metadata'

type Props = {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('page-seo')

  return buildPageMetadata({
    locale,
    path: '/leaderboard',
    title: t('leaderboard.title'),
    description: t('leaderboard.description'),
  })
}

export default function LeaderboardLayout({ children }: Props) {
  return <>{children}</>
}
