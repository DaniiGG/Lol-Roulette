import Script from 'next/script'

export default function RootHead() {
  return (
    <>
      <meta name="google-adsense-account" content="ca-pub-1048626365060254" />
      <meta name="google-site-verification" content="3sVvOH8RoSBRMz3-yWd4pFKr5fcoclC4VZXl7GNi4ic" />
      <meta name="theme-color" content="#C89B3C" />
      <Script type="text/javascript" async data-noptimize="1" data-cfasync="false" src="//scripts.scriptwrapper.com/tags/5b012155-52f9-43ac-afd4-fcefde79ff33.js"/>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              { '@type': 'Organization', name: 'League Roulette', alternateName: 'League Roulette LoL', url: 'https://leagueroulette.com', logo: 'https://leagueroulette.com/og-image.png', description: 'Free random champion generator for League of Legends with match verification, XP tracking, achievements, and leaderboards.', contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: 'https://leagueroulette.com/contact' }, founders: [{ '@type': 'Person', name: 'League Roulette Team' }] },
              { '@type': 'WebSite', name: 'League Roulette', url: 'https://leagueroulette.com', description: 'Free random lol champion generator and League of Legends roulette.' },
              { '@type': 'WebApplication', name: 'League Roulette', url: 'https://leagueroulette.com', applicationCategory: 'GameApplication', operatingSystem: 'Web', description: 'Random champion generator for League of Legends.', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, featureList: ['Random champion generator for all lanes', 'Match verification via Riot Games API', 'XP and leveling system', 'Achievements and leaderboards'] },
            ],
          }),
        }}
      />
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=GTM-WG86XDJF'+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WG86XDJF');`,
        }}
      />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-2D2RD00KWB" strategy="afterInteractive" />
      <Script id="ga-script" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-2D2RD00KWB');
      `}</Script>
    </>
  )
}
