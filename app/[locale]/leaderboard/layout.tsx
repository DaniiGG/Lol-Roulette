import type { Metadata } from "next"
import { getHreflangAlternates } from '@/lib/seo-utils'

type Props = {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Leaderboard - League Roulette | Top Players & Rankings',
    description: 'View the League Roulette leaderboard. See top players by XP, level, challenges completed, win streaks, and more. Compete for the #1 spot!',
    keywords: ['league roulette leaderboard', 'lol random champion leaderboard', 'top league roulette players', 'random champion challenge rankings', 'lol challenge leaderboard'],
    alternates: {
      canonical: locale === 'en' ? '/leaderboard' : `/${locale}/leaderboard`,
      languages: getHreflangAlternates('/leaderboard'),
    },
    openGraph: {
      title: 'League Roulette Leaderboard | Top Players',
      description: 'Compete for the top spot on the League Roulette leaderboard. Track XP, streaks, and achievements.',
      url: locale === 'en' ? '/leaderboard' : `/${locale}/leaderboard`,
      siteName: 'League Roulette',
    },
  }
}

export default function LeaderboardLayout({ children }: Props) {
  return <>{children}</>
}
