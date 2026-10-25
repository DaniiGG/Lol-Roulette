import type { Metadata } from 'next'

export const rootMetadata: Metadata = {
  title: {
    default: 'League Roulette - Random Champion & LoL Randomizer',
    template: '%s | League Roulette',
  },
  description:
    'Free random LoL champion generator & League of Legends roulette. Spin for a random champion, verify wins with Riot API, earn XP, and climb the leaderboard.',
  metadataBase: new URL('https://leagueroulette.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://leagueroulette.com',
    title: 'League Roulette - Random Champion & LoL Randomizer',
    description: 'Spin for a random champion, verify wins with Riot API, earn XP, and climb the leaderboard.',
    siteName: 'League Roulette',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'League Roulette' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'League Roulette - Random LoL Picker & League of Legends Roulette',
    description: 'Spin for a random champion, verify wins, earn XP.',
    images: ['/og-image.png'],
    creator: '@LeagueRoulette',
  },
  other: {
    'X-Robots-Tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  },
}
