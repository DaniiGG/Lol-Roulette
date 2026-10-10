import type { BlogCategorySlug } from './meta'

type BlogCategoryType = {
  slug: BlogCategorySlug
  name: string
  order: number
  appHref?: string
}

export type BlogCategory = BlogCategoryType

export const CATEGORIES: BlogCategory[] = [
  { slug: 'champions', name: 'Champion Guides', order: 1, appHref: '/' },
  { slug: 'guides', name: 'Guides', order: 2 },
  { slug: 'tier-lists', name: 'Tier Lists', order: 3, appHref: '/tierlist' },
  { slug: 'beginners', name: 'Beginner Guides', order: 4 },
  { slug: 'ranked', name: 'Ranked', order: 5 },
  { slug: 'mechanics', name: 'Mechanics', order: 6 },
  { slug: 'league-roulette', name: 'League Roulette', order: 7, appHref: '/' },
]

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug)

export function isCategorySlug(slug: string): slug is BlogCategorySlug {
  return CATEGORY_SLUGS.includes(slug as BlogCategorySlug)
}

export function getCategory(slug: string): BlogCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}