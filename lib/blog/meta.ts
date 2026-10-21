export type BlogCategorySlug =
  | 'champions'
  | 'guides'
  | 'tier-lists'
  | 'beginners'
  | 'ranked'
  | 'mechanics'
  | 'league-roulette'

export type BlogPostMeta = {
  publishedAt: string
  updatedAt?: string
  author: string
  category: BlogCategorySlug
  lane?: string
  keywords: string[]
  /** Locales with a real (fully localized) translation of this post. */
  translatedIn: string[]
  /** Explicit, editorially chosen related posts (by slug). */
  related: string[]
  /** Optional SEO overrides. */
  seoTitle?: string
  seoDescription?: string
  /** Locale-specific SEO overrides (take precedence over the fields above). */
  seoTitleByLocale?: Record<string, string>
  seoDescriptionByLocale?: Record<string, string>
  /**
   * Locale-specific public slug. The content keeps a canonical `slug`,
   * while each locale can expose an SEO-friendly translated URL.
   */
  localizedSlugs?: Record<string, string>
  /** Public URL for the post's cover image, e.g. /images/blog/post-slug.webp. */
  image?: string
  imageAlt?: string
  imageAltByLocale?: Record<string, string>
}

/**
 * Canonical metadata for every blog post, independent of locale.
 * Content (title, sections, ...) lives in locales/{locale}/blog-content.json.
 * Keep `category` values in sync with CATEGORIES in ./categories.
 */
export const BLOG_POST_META: Record<string, BlogPostMeta> = {
  'what-champion-should-i-play': {
    publishedAt: '2026-01-15',
    author: 'League Roulette Team',
    category: 'league-roulette',
    lane: 'all-lanes',
    keywords: [
      'what champion should i play lol',
      'league of legends random champion generator',
      'lol random champion generator',
      'random champion picker lol',
      'what champion should i main in league',
    ],
    translatedIn: ['en', 'es'],
    related: ['what-is-my-main', 'best-champions-for-beginners', 'how-to-climb-ranked'],
    seoTitle: 'What Champion Should I Play in League of Legends? Find Your Best Role',
    seoDescription:
      'Not sure what to main? A practical breakdown of every role, the playstyles that fit each one, and how to pick a champion you will actually enjoy.',
  },
  'lol-random-challenge': {
    publishedAt: '2026-01-22',
    author: 'League Roulette Team',
    category: 'league-roulette',
    lane: 'all-lanes',
    keywords: [
      'lol random challenge ideas',
      'league of legends random challenge',
      'lol roulette challenge',
      'random champion challenge league',
      'fun lol challenges with friends',
    ],
    translatedIn: ['en', 'es'],
    related: ['fun-lol-challenges', 'fun-lol-challenges-with-friends', 'what-champion-should-i-play'],
  },
  'fun-lol-challenges': {
    publishedAt: '2026-02-01',
    author: 'League Roulette Team',
    category: 'league-roulette',
    lane: 'all-lanes',
    keywords: [
      'fun ways to play league of legends',
      'fun lol challenges',
      'league of legends challenge ideas',
      'random champion generator lol fun',
      'lol games to play with friends',
    ],
    translatedIn: ['en', 'es'],
    related: ['lol-random-challenge', 'fun-lol-challenges-with-friends', 'champion-rotation-guide'],
  },
  'what-is-my-main': {
    publishedAt: '2026-04-05',
    author: 'League Roulette Team',
    category: 'league-roulette',
    lane: 'all-lanes',
    keywords: [
      'what is my main league of legends',
      'how to choose your main champion',
      'find your main champion',
      'league of legends role quiz',
      'what champion should i main',
    ],
    translatedIn: ['en', 'es'],
    related: ['what-champion-should-i-play', 'best-champions-for-beginners', 'fun-lol-challenges'],
  },
  'fun-lol-challenges-with-friends': {
    publishedAt: '2026-04-12',
    author: 'League Roulette Team',
    category: 'league-roulette',
    lane: 'all-lanes',
    keywords: [
      'fun lol challenges with friends',
      'lol challenges with friends',
      'random champion challenges',
      'team challenges league',
      'best lol party modes',
    ],
    translatedIn: ['en', 'es'],
    related: ['fun-lol-challenges', 'lol-random-challenge', 'how-to-climb-ranked'],
  },
  'best-champions-for-top-lane': {
    publishedAt: '2026-02-10',
    updatedAt: '2026-09-20',
    author: 'League Roulette Team',
    category: 'champions',
    lane: 'top-lane',
    keywords: [
      'best top lane champions',
      'top lane champions current patch',
      'top lane carry champions',
      'how to climb ranked top lane',
      'best solo queue top lane',
    ],
    translatedIn: ['en', 'es'],
    related: ['mid-lane-champions-guide', 'understanding-lane-matchups', 'champions-that-counter'],
  },
  'mid-lane-champions-guide': {
    publishedAt: '2026-02-18',
    updatedAt: '2026-09-20',
    author: 'League Roulette Team',
    category: 'champions',
    lane: 'mid-lane',
    keywords: [
      'mid lane champions',
      'best mid lane champions',
      'control mage guide',
      'mid lane assassin picks',
      'how to play mid lane league',
    ],
    translatedIn: ['en', 'es'],
    related: ['best-champions-for-top-lane', 'understanding-lane-matchups', 'how-to-farm-in-league'],
  },
  'adc-champions-guide': {
    publishedAt: '2026-02-25',
    updatedAt: '2026-09-20',
    author: 'League Roulette Team',
    category: 'champions',
    lane: 'adc',
    keywords: [
      'best ADC champions',
      'ADC carry guide',
      'hyper carry champions',
      'ranked ADC picks',
      'how to climb with ADC',
    ],
    translatedIn: ['en', 'es'],
    related: ['best-support-champions', 'how-to-farm-in-league', 'understanding-lane-matchups'],
  },
  'best-support-champions': {
    publishedAt: '2026-03-05',
    updatedAt: '2026-09-20',
    author: 'League Roulette Team',
    category: 'champions',
    lane: 'support',
    keywords: [
      'best support champions',
      'current patch support',
      'engage support guide',
      'peel support picks',
      'best ranked support',
    ],
    translatedIn: ['en', 'es'],
    related: ['adc-champions-guide', 'understanding-lane-matchups', 'champions-that-counter'],
  },
  'aram-champion-pool': {
    publishedAt: '2026-03-20',
    author: 'League Roulette Team',
    category: 'champions',
    lane: 'aram',
    keywords: ['ARAM champion pool', 'best ARAM champions', 'how to win ARAM games', 'ARAM guide', 'ARAM strategy tips'],
    translatedIn: ['en', 'es'],
    related: ['fun-lol-challenges', 'how-to-improve-at-league', 'champion-rotation-guide'],
  },
  'champions-that-counter': {
    publishedAt: '2026-03-28',
    author: 'League Roulette Team',
    category: 'champions',
    lane: 'all-lanes',
    keywords: [
      'champions that counter',
      'lane counters league of legends',
      'counter picks league',
      'how to counter',
      'champion matchups',
    ],
    translatedIn: ['en', 'es'],
    related: ['understanding-lane-matchups', 'best-champions-for-top-lane', 'best-support-champions'],
  },
  'how-to-improve-at-league': {
    publishedAt: '2026-03-12',
    author: 'League Roulette Team',
    category: 'guides',
    lane: 'all-lanes',
    keywords: [
      'how to improve at league of legends',
      'loL improvement tips',
      'climb ranked ladder',
      'macro gameplay guide',
      'mechanical practice drills',
    ],
    translatedIn: ['en', 'es'],
    related: ['how-to-farm-in-league', 'how-to-climb-ranked', 'understanding-lane-matchups'],
  },
  'understanding-lane-matchups': {
    publishedAt: '2026-05-20',
    author: 'League Roulette Team',
    category: 'guides',
    lane: 'all-lanes',
    keywords: [
      'lane matchups league of legends',
      'champion matchups',
      'how to play around matchups',
      'lol lane counters',
      'best matchup guide',
    ],
    translatedIn: ['en', 'es'],
    related: ['champions-that-counter', 'how-to-improve-at-league', 'best-champions-for-top-lane'],
  },
  'champion-rotation-guide': {
    publishedAt: '2026-05-28',
    author: 'League Roulette Team',
    category: 'guides',
    lane: 'all-lanes',
    keywords: [
      'champion rotation guide',
      'free champions this week',
      'league free week',
      'which free champion to play',
      'maximize free champion week',
    ],
    translatedIn: ['en', 'es'],
    related: ['what-champion-should-i-play', 'best-champions-for-beginners', 'aram-champion-pool'],
  },
  'best-champions-for-beginners': {
    publishedAt: '2026-05-05',
    updatedAt: '2026-09-20',
    author: 'League Roulette Team',
    category: 'beginners',
    lane: 'all-lanes',
    keywords: [
      'best champions for beginners',
      'easy league champions',
      'starting league of legends',
      'beginner friendly champions',
      'lol new player guide',
    ],
    translatedIn: ['en', 'es'],
    related: ['what-champion-should-i-play', 'how-to-farm-in-league', 'how-to-improve-at-league'],
  },
  'how-to-climb-ranked': {
    publishedAt: '2026-04-20',
    author: 'League Roulette Team',
    category: 'ranked',
    lane: 'all-lanes',
    keywords: [
      'how to climb ranked league',
      'ranked climb guide',
      'league of legends climb',
      'climb ranked ladder',
      'end of season ranked tips',
    ],
    translatedIn: ['en', 'es'],
    related: ['how-to-improve-at-league', 'how-to-farm-in-league', 'lol-tier-list-current-patch'],
  },
  'lol-tier-list-current-patch': {
    publishedAt: '2026-04-28',
    updatedAt: '2026-09-25',
    author: 'League Roulette Team',
    category: 'tier-lists',
    lane: 'all-lanes',
    keywords: [
      'lol tier list current patch',
      'champion tier list',
      'best champions by role',
      'high elo tier list',
      'league of legends tier list',
    ],
    translatedIn: ['en', 'es'],
    related: ['best-champions-for-top-lane', 'how-to-climb-ranked', 'champions-that-counter'],
  },
  'how-to-farm-in-league': {
    publishedAt: '2026-05-12',
    author: 'League Roulette Team',
    category: 'mechanics',
    lane: 'all-lanes',
    keywords: [
      'how to farm in league of legends',
      'last hitting guide',
      'wave management league',
      'farming practice drills',
      'improve cs league',
    ],
    translatedIn: ['en', 'es'],
    related: ['how-to-improve-at-league', 'adc-champions-guide', 'mid-lane-champions-guide'],
  },
  'worlds-2026-guide': {
    publishedAt: '2026-10-17',
    author: 'League Roulette Team',
    category: 'guides',
    lane: 'all-lanes',
    keywords: [
      'lol worlds 2026',
      'league of legends worlds 2026',
      'lol world championship',
      'worlds 2026 teams',
      'league of legends esports',
      'lol worlds format',
    ],
    translatedIn: ['en', 'es'],
    related: ['how-to-improve-at-league', 'how-to-climb-ranked', 'lol-tier-list-current-patch'],
    seoTitle: 'LoL Worlds 2026: Everything You Need to Know',
    seoDescription:
      'Discover everything about LoL Worlds 2026, from the tournament format and top teams to the biggest storylines and what fans should watch.',
    image: '/images/blog/worlds20262.webp',
    imageAlt: 'LoL Worlds 2026: Everything You Need to Know About the World Championship',
  },
  'lol-patch-26-21': {
    publishedAt: '2026-10-19',
    updatedAt: '2026-10-19',
    author: 'League Roulette Team',
    category: 'guides',
    keywords: [
      'lol patch 26.21',
      'league of legends patch 26.21',
      'lol patch notes 26.21',
      'lol champion buffs and nerfs',
      'patch 26.21 item changes',
    ],
    translatedIn: ['en', 'es'],
    related: ['worlds-2026-guide', 'lol-tier-list-current-patch', 'how-to-climb-ranked'],
    seoTitle: undefined,
    seoDescription: undefined,
    image: '/images/blog/parche21oct.jpg',
    imageAlt: 'Patch 26.21 of League of Legends: buffs, nerfs y object changes',
  },
  'lol-patch-26-21-tier-list': {
    publishedAt: '2026-10-21',
    updatedAt: '2026-10-21',
    author: 'League Roulette Team',
    category: 'tier-lists',
    lane: 'all-lanes',
    keywords: [
      'lol patch 26.21 tier list',
      'best champions patch 26.21',
      'best champions for climbing ranked',
      'best top laners',
      'best jungle champions',
      'best mid laners',
      'best adc champions',
      'best support champions',
      'tier list lol parche 26.21',
      'mejores campeones lol parche 26.21',
      'mejores campeones para subir de elo',
    ],
    translatedIn: ['en', 'es'],
    related: ['lol-patch-26-21', 'how-to-climb-ranked', 'lol-tier-list-current-patch'],
    seoTitle: 'LoL Patch 26.21 Tier List: Best Champions for Every Role',
    seoDescription:
      'Explore the LoL Patch 26.21 tier list for Top, Jungle, Mid, ADC and Support. Compare champion picks and find your next ranked main.',
    seoTitleByLocale: {
      en: 'LoL Patch 26.21 Tier List: Best Champions for Every Role',
      es: 'Tier List LoL Parche 26.21: Mejores Campeones por Línea',
    },
    seoDescriptionByLocale: {
      en: 'Explore the LoL Patch 26.21 tier list for Top, Jungle, Mid, ADC and Support. Compare champion picks and find your next ranked main.',
      es: 'Descubre la tier list de LoL 26.21 para Top, Jungla, Mid, ADC y Support. Compara los mejores picks y encuentra campeones para subir de elo.',
    },
    localizedSlugs: {
      es: 'tier-list-lol-parche-26-21',
    },
    image: '/images/blog/tierlist21oct.jpg',
    imageAlt:
      'League of Legends Patch 26.21 tier list with champion portraits for every role',
    imageAltByLocale: {
      en: 'League of Legends Patch 26.21 tier list with champion portraits for every role',
      es: 'Tier list del parche 26.21 de League of Legends con retratos de campeones para cada línea',
    },
  },
}

export const BLOG_SLUGS = Object.keys(BLOG_POST_META)

export const ALL_LANES = 'all-lanes'

export function getPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POST_META[slug]
}

export function getLaneForSlug(slug: string): string {
  return BLOG_POST_META[slug]?.lane ?? ALL_LANES
}

export function getKeywordsForSlug(slug: string): string[] {
  return BLOG_POST_META[slug]?.keywords ?? []
}

export function getRelatedSlugs(slug: string): string[] {
  return (BLOG_POST_META[slug]?.related ?? []).filter((s) => s !== slug && BLOG_POST_META[s])
}

/**
 * Locales that have a real translation of a given post.
 * Drives hreflang output and the "available in" switcher.
 * Never invent availability: only locales listed here count.
 */
export function getAvailableLocales(slug: string): string[] {
  return BLOG_POST_META[slug]?.translatedIn ?? ['en']
}

/** Public slug for a locale, falling back to the canonical slug. */
export function getLocalizedSlug(slug: string, locale: string): string {
  return BLOG_POST_META[slug]?.localizedSlugs?.[locale] ?? slug
}

/** Localized public path for a blog post. */
export function getPostHref(slug: string, locale: string): string {
  const localized = getLocalizedSlug(slug, locale)
  return locale === 'en' ? `/blog/${localized}` : `/${locale}/blog/${localized}`
}

/**
 * Resolve a URL slug and locale back to the canonical content slug.
 * Supports both localized slugs and the canonical slug.
 */
export function resolvePostSlug(slug: string, locale: string): string | undefined {
  if (BLOG_POST_META[slug]) return slug
  return BLOG_SLUGS.find((canonical) => getLocalizedSlug(canonical, locale) === slug)
}

export function getSeoTitle(slug: string, locale: string): string | undefined {
  const meta = BLOG_POST_META[slug]
  return meta?.seoTitleByLocale?.[locale] ?? meta?.seoTitle
}

export function getSeoDescription(slug: string, locale: string): string | undefined {
  const meta = BLOG_POST_META[slug]
  return meta?.seoDescriptionByLocale?.[locale] ?? meta?.seoDescription
}

export function getImageAlt(slug: string, locale: string): string | undefined {
  const meta = BLOG_POST_META[slug]
  return meta?.imageAltByLocale?.[locale] ?? meta?.imageAlt
}

export function getTagsForSlug(slug: string): string[] {
  const meta = BLOG_POST_META[slug]
  if (!meta) return []
  const tags: string[] = []
  if (meta.category !== 'league-roulette') tags.push(meta.category)
  if (meta.lane && meta.lane !== ALL_LANES) tags.push(meta.lane)
  const postSlug = slug
  if (postSlug.includes('beginner')) tags.push('beginner')
  if (postSlug.includes('tier-list')) tags.push('meta')
  if (postSlug.includes('ranked')) tags.push('climb')
  return tags
}
