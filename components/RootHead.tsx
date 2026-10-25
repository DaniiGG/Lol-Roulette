import Script from 'next/script'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is League Roulette?', acceptedAnswer: { '@type': 'Answer', text: 'League Roulette is a free random champion generator and champion roulette for League of Legends.' } },
    { '@type': 'Question', name: 'How does match verification work?', acceptedAnswer: { '@type': 'Answer', text: 'We use Riot Games official API to verify that you played and won with the assigned champion.' } },
    { '@type': 'Question', name: 'Can I filter champions by lane?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! You can select your preferred lane and get a random champion that fits that role.' } },
  ],
}

export default function RootHead() {
  return (
    <>
      <meta name="google-adsense-account" content="ca-pub-1048626365060254" />
      <meta name="google-site-verification" content="3sVvOH8RoSBRMz3-yWd4pFKr5fcoclC4VZXl7GNi4ic" />
      <meta name="theme-color" content="#C89B3C" />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://leagueroulette.com' }],
          }),
        }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              { '@type': 'Organization', name: 'League Roulette', alternateName: 'League Roulette LoL', url: 'https://leagueroulette.com', logo: 'https://leagueroulette.com/og-image.png', sameAs: ['https://twitter.com/LeagueRoulette', 'https://www.facebook.com/LeagueRoulette', 'https://www.reddit.com/r/LeagueRoulette', 'https://discord.gg/leagueroulette', 'https://www.youtube.com/@LeagueRoulette', 'https://www.tiktok.com/@leagueroulette'], description: 'Free random champion generator for League of Legends with match verification, XP tracking, achievements, and leaderboards.', contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: 'https://leagueroulette.com/contact' }, founders: [{ '@type': 'Person', name: 'League Roulette Team' }] },
              { '@type': 'WebSite', name: 'League Roulette', url: 'https://leagueroulette.com', description: 'Free random lol champion generator and League of Legends roulette.', potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://leagueroulette.com/?s={search_term_string}' }, 'query-input': 'required name=search_term_string' } },
              { '@type': 'WebApplication', name: 'League Roulette', url: 'https://leagueroulette.com', applicationCategory: 'GameApplication', operatingSystem: 'Web', description: 'Random champion generator for League of Legends.', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, featureList: ['Random champion generator for all lanes', 'Match verification via Riot Games API', 'XP and leveling system', 'Achievements and leaderboards'] },
              { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://leagueroulette.com' }] },
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
