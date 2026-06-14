import type { Metadata } from "next"
import { getHreflangAlternates } from '@/lib/seo-utils'

type Props = {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Champion Mastery - League Roulette | Check Your LoL Mastery Points',
    description: 'Check your League of Legends champion mastery points and win rates. Track your most played champions and performance with the League Roulette mastery tool.',
    keywords: ['league of legends champion mastery', 'lol mastery points', 'champion mastery check', 'league roulette mastery', 'lol win rate tracker'],
    alternates: {
      canonical: locale === 'en' ? '/mastery' : `/${locale}/mastery`,
      languages: getHreflangAlternates('/mastery'),
    },
    openGraph: {
      title: 'Champion Mastery - League Roulette',
      description: 'Check your LoL champion mastery points and win rates. Track your most played champions.',
      url: locale === 'en' ? '/mastery' : `/${locale}/mastery`,
      siteName: 'League Roulette',
    },
  }
}

export default function MasteryLayout({ children }: Props) {
  return <>{children}</>
}
