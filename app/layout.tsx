import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Random Champion Generator for League of Legends (LoL Roulette)',
  description: 'Spin the roulette to get a random League of Legends champion! Track your wins, earn XP, unlock achievements, and compete on the leaderboard. Free LoL random champion generator.',
  keywords: 'league of legends, lol, random champion, champion roulette, lol roulette, random pick, league challenge, lol challenge, summoner stats, league tracker',
  authors: [{ name: 'League Roulette' }],
  creator: 'League Roulette',
  publisher: 'League Roulette',
  metadataBase: new URL('https://lol-roulette-nine.vercel.app'),

  // Open Graph (para redes sociales)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lol-roulette-nine.vercel.app',
    title: 'League Roulette - Random Champion Challenge',
    description: 'Get random League of Legends champions and track your wins!',
    siteName: 'League Roulette',
    images: [
      {
        url: '/og-image.png', // Crearemos esto
        width: 1200,
        height: 630,
        alt: 'League Roulette'
      }
    ]
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'League Roulette - Random Champion Challenge',
    description: 'Get random League of Legends champions and track your wins!',
    images: ['/og-image.png'],
    creator: '@LeagueRoulette' // Tu Twitter si tienes
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification (Google Search Console)
  verification: {
    google: 'tu-codigo-de-verificacion-aqui', // Lo obtienes después
  },
  
  // Otros
  alternates: {
    canonical: 'https://lol-roulette-nine.vercel.app',
  },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <meta name="google-adsense-account" content="ca-pub-1048626365060254"></meta>
        <meta name="google-site-verification" content="3sVvOH8RoSBRMz3-yWd4pFKr5fcoclC4VZXl7GNi4ic" />
      <head>
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'League Roulette',
              description: 'Random champion generator and challenge tracker for League of Legends',
              url: 'https://lol-roulette-nine.vercel.app',
              applicationCategory: 'Game',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1250'
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
