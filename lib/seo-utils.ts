import { routing } from '@/i18n/routing'

const baseUrl = 'https://leagueroulette.com'

export function getHreflangAlternates(path: string) {
  const languages: Record<string, string> = {}

  for (const locale of routing.locales) {
    languages[locale] = locale === routing.defaultLocale
      ? `${baseUrl}${path}`
      : `${baseUrl}/${locale}${path}`
  }

  languages['x-default'] = `${baseUrl}${path}`

  return languages
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'League Roulette',
    url: baseUrl,
    logo: `${baseUrl}/og-image.png`,
    sameAs: ['https://twitter.com/LeagueRoulette'],
    description: 'Free random champion generator for League of Legends with match verification, XP tracking, achievements, and leaderboards.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${baseUrl}/contact`,
    },
  }
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'League Roulette',
    url: baseUrl,
    description: 'Free random lol champion generator and League of Legends roulette. Champion roulette with win tracking.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?s={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function getWebApplicationSchema() {
  return {
    '@type': 'WebApplication',
    name: 'League Roulette',
    url: baseUrl,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    description: 'Random lol champion generator and League of Legends roulette. Spin for random champion picks, verify matches, and track wins.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Random champion generator for all lanes',
      'Champion roulette with unlimited spins',
      'Match verification via Riot Games API',
      'XP and leveling system',
      'Achievements and leaderboards',
    ],
  }
}

export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  }
}

export function getGraphSchema(schemas: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  }
}
