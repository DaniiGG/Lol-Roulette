import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from 'next/script'
import { getHreflangAlternates } from '@/lib/seo-utils'

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: 'League Roulette - Random Champion & LoL Randomizer',
      template: '%s | League Roulette',
    },
    description: 'Free random LoL champion generator & League of Legends roulette. Spin for a random champion, verify wins with Riot API, earn XP, and climb the leaderboard.',
    metadataBase: new URL('https://leagueroulette.com'),
    manifest: '/manifest.json',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    alternates: {
      languages: getHreflangAlternates('/'),
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
  }
}

const geistSans = { variable: '' } as any;
const geistMono = { variable: '' } as any;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1048626365060254" />
        <meta name="google-site-verification" content="3sVvOH8RoSBRMz3-yWd4pFKr5fcoclC4VZXl7GNi4ic" />
        <meta name="theme-color" content="#C89B3C" />
        <meta name="google-adsense-account" content="ca-pub-1048626365060254"/>
        <Script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "League Roulette",
                  "url": "https://leagueroulette.com",
                  "logo": "https://leagueroulette.com/og-image.png",
                  "sameAs": [
                    "https://twitter.com/LeagueRoulette"
                  ],
                  "description": "Free random champion generator for League of Legends with match verification, XP tracking, achievements, and leaderboards.",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "url": "https://leagueroulette.com/contact"
                  }
                },
                {
                  "@type": "WebSite",
                  "name": "League Roulette",
                  "url": "https://leagueroulette.com",
                  "description": "Free random lol champion generator and League of Legends roulette. Champion roulette with win tracking.",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://leagueroulette.com/?s={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "WebApplication",
                  "name": "League Roulette",
                  "url": "https://leagueroulette.com",
                  "applicationCategory": "GameApplication",
                  "operatingSystem": "Web",
                  "description": "Random champion generator for League of Legends. Spin the roulette, get random LoL picks, verify matches with Riot API, and climb leaderboards.",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "featureList": [
                    "Random champion generator for all lanes",
                    "Match verification via Riot Games API",
                    "XP and leveling system",
                    "Achievements and leaderboards",
                    "Unlimited rerolls",
                    "Multi-language support"
                  ],
                  "screenshot": "https://leagueroulette.com/og-image.png"
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://leagueroulette.com" }
                  ]
                }
              ]
            })
          }} />
        <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=GTM-WG86XDJF'+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WG86XDJF');`
          }} />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-2D2RD00KWB" strategy="afterInteractive" />
        <Script id="ga-script" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2D2RD00KWB');
          `}</Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WG86XDJF" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>
        {children}
      </body>
    </html>
  );
}
