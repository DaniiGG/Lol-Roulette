import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from 'next/script'

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: 'LoL Random Champion Generator | Spin the Roulette & Get a Random Pick',
    template: '%s | League Roulette',
  },
  description: 'Not sure what to play in League of Legends? Spin the random champion roulette, challenge your friends, track wins, earn XP, and climb the leaderboard. Free LoL randomizer!',
  metadataBase: new URL('https://lol-roulette-nine.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lol-roulette-nine.vercel.app',
    title: 'League Roulette - Random Champion Challenge',
    description: 'Get random League of Legends champions and track your wins!',
    siteName: 'League Roulette',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'League Roulette' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'League Roulette - Random Champion Challenge',
    description: 'Get random League of Legends champions and track your wins!',
    images: ['/og-image.png'],
    creator: '@LeagueRoulette'
  },
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