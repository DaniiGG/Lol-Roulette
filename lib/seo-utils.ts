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
  }
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'League Roulette',
    url: baseUrl,
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
