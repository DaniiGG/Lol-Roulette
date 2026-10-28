/**
 * Editorial Spanish slugs for blog posts.
 * Pure data so it can be consumed by both runtime helpers and next.config.ts.
 */
export const SPANISH_BLOG_SLUGS: Record<string, string> = {
  'what-champion-should-i-play': 'que-campeon-deberia-jugar',
  'lol-random-challenge': 'reto-aleatorio-lol',
  'fun-lol-challenges': 'retos-divertidos-lol',
  'what-is-my-main': 'cual-es-mi-main',
  'fun-lol-challenges-with-friends': 'retos-lol-con-amigos',
  'best-champions-for-top-lane': 'mejores-campeones-top',
  'mid-lane-champions-guide': 'guia-campeones-mid',
  'adc-champions-guide': 'guia-campeones-adc',
  'best-support-champions': 'mejores-campeones-support',
  'aram-champion-pool': 'pool-campeones-aram',
  'champions-that-counter': 'campeones-que-hacen-counter',
  'how-to-improve-at-league': 'como-mejorar-en-lol',
  'understanding-lane-matchups': 'entender-los-matchups',
  'champion-rotation-guide': 'guia-rotacion-campeones',
  'best-champions-for-beginners': 'mejores-campeones-para-principiantes',
  'how-to-climb-ranked': 'como-subir-de-elo',
  'lol-tier-list-current-patch': 'tier-list-lol-parche-actual',
  'how-to-farm-in-league': 'como-hacer-farm-en-lol',
  'worlds-2026-guide': 'guia-worlds-2026',
  'lol-patch-26-21': 'parche-26-21-lol',
  'lol-patch-26-21-tier-list': 'tier-list-parche-26-21',
}

/** Legacy Spanish slugs that were live before the localized URL migration. */
export const LEGACY_SPANISH_BLOG_SLUGS: Record<string, string> = {
  'tier-list-lol-parche-26-21': 'tier-list-parche-26-21',
}

/** Spanish slugs for champion guides. */
export const SPANISH_GUIDE_SLUGS: Record<string, string> = {
  katarina: 'como-jugar-katarina',
  sett: 'como-jugar-sett',
  ksante: 'como-jugar-ksante',
}
