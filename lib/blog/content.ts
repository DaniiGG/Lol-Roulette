import { getPostMeta, getRelatedSlugs } from './meta'
import type { BlogCategorySlug } from './meta'

export type BlogTable = {
  headers: string[]
  rows: string[][]
}

export type PatchChangeRow = {
  /** Data Dragon champion asset id, e.g. "Azir", "LeeSin", "MonkeyKing". */
  championId: string
  name: string
  role?: string
  ability: string
  before: string
  after: string
  change: string
  impact: string
  type: 'buff' | 'nerf'
}

export type ItemChangeRow = {
  /** Data Dragon numeric item id as a string, e.g. "2520". */
  itemId: string
  name: string
  stat: string
  before: string
  after: string
  change?: string
  impact: string
  type: 'buff' | 'nerf' | 'adjustment'
}

export type BlogPatchTable = {
  kind: 'champion-buffs' | 'champion-nerfs' | 'item-changes'
  headers: string[]
  rows: (PatchChangeRow | ItemChangeRow)[]
}

export type BlogCta = {
  label: string
  href: string
}

export type BlogSource = {
  label: string
  url: string
}

export type BlogSubsection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export type BlogInternalLink = {
  label: string
  href: string
  description?: string
}

export type BlogSection = {
  heading: string
  /** Optional: some sections are list or table driven. */
  paragraphs?: string[]
  bullets?: string[]
  subsections?: BlogSubsection[]
  links?: BlogInternalLink[]
  table?: BlogTable
  patchTable?: BlogPatchTable
  cta?: BlogCta
}

export type BlogFaqItem = {
  q: string
  a: string
}

export type BlogPost = {
  slug: string
  title: string
  description: string
  keywords: string[]
  excerpt: string
  ctaLabel: string
  ctaHref: string
  heroIntro: string[]
  sections: BlogSection[]
  faq?: BlogFaqItem[]
  sources?: BlogSource[]
}

const WORDS_PER_MINUTE = 200

export function postWordCount(post: BlogPost): number {
  let words = 0
  for (const p of post.heroIntro ?? []) words += p.split(/\s+/).length
  for (const s of post.sections ?? []) {
    words += s.heading.split(/\s+/).length
    for (const p of s.paragraphs ?? []) words += p.split(/\s+/).length
    for (const b of s.bullets ?? []) words += b.split(/\s+/).length
    for (const sub of s.subsections ?? []) {
      words += sub.heading.split(/\s+/).length
      for (const p of sub.paragraphs ?? []) words += p.split(/\s+/).length
      for (const b of sub.bullets ?? []) words += b.split(/\s+/).length
    }
    for (const link of s.links ?? []) {
      words += `${link.label} ${link.description ?? ''}`.split(/\s+/).length
    }
    if (s.table) {
      for (const h of s.table.headers) words += h.split(/\s+/).length
      for (const row of s.table.rows) for (const cell of row) words += cell.split(/\s+/).length
    }
    if (s.patchTable) {
      for (const h of s.patchTable.headers) words += h.split(/\s+/).length
      for (const row of s.patchTable.rows) {
        const r = row as Record<string, string>
        for (const v of Object.values(r)) words += v.split(/\s+/).length
      }
    }
    if (s.cta) {
      words += s.cta.label.split(/\s+/).length
      for (const p of s.paragraphs ?? []) words += p.split(/\s+/).length
    }
  }
  for (const f of post.faq ?? []) {
    words += f.q.split(/\s+/).length + f.a.split(/\s+/).length
  }
  return words
}

export function readingTime(post: BlogPost): number {
  return Math.max(1, Math.round(postWordCount(post) / WORDS_PER_MINUTE))
}

export function findPost(posts: BlogPost[], slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

export function postsByCategory(posts: BlogPost[], category: BlogCategorySlug): BlogPost[] {
  return posts.filter((p) => getPostMeta(p.slug)?.category === category)
}

export function sortByPublishedDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const da = getPostMeta(a.slug)?.publishedAt ?? ''
    const db = getPostMeta(b.slug)?.publishedAt ?? ''
    return db.localeCompare(da)
  })
}

/**
 * Related posts: explicitly chosen slugs first, then filled with
 * same-category posts (most recent first). Never random.
 */
export function relatedPosts(posts: BlogPost[], slug: string, limit = 4): BlogPost[] {
  const all = findPost(posts, slug)
  if (!all) return []
  const seen = new Set<string>([slug])
  const out: BlogPost[] = []

  for (const relSlug of getRelatedSlugs(slug)) {
    if (out.length >= limit) break
    if (seen.has(relSlug)) continue
    const rel = findPost(posts, relSlug)
    if (rel) {
      out.push(rel)
      seen.add(relSlug)
    }
  }

  const category = getPostMeta(slug)?.category
  if (out.length < limit) {
    const fill = sortByPublishedDesc(
      posts.filter((p) => getPostMeta(p.slug)?.category === category)
    )
    for (const p of fill) {
      if (out.length >= limit) break
      if (seen.has(p.slug)) continue
      out.push(p)
      seen.add(p.slug)
    }
  }

  if (out.length < limit) {
    for (const p of sortByPublishedDesc(posts)) {
      if (out.length >= limit) break
      if (seen.has(p.slug)) continue
      out.push(p)
      seen.add(p.slug)
    }
  }

  return out.slice(0, limit)
}

/**
 * Lightweight client-safe search across the current locale's posts.
 * Matches title, excerpt, description and slug (champion names, etc.).
 */
export function searchPosts(posts: BlogPost[], query: string, limit = 6): BlogPost[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const scored = posts
    .map((p) => {
      let score = 0
      const title = p.title.toLowerCase()
      const slug = p.slug.toLowerCase()
      const excerpt = p.excerpt.toLowerCase()
      const description = p.description.toLowerCase()
      if (title === q) score += 100
      if (title.startsWith(q)) score += 60
      if (title.includes(q)) score += 40
      if (slug.includes(q)) score += 30
      if (excerpt.includes(q)) score += 15
      if (description.includes(q)) score += 10
      return { p, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((r) => r.p)
}

export function formatDate(iso: string, locale: string, opts?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...opts,
    }).format(new Date(`${iso}T00:00:00`))
  } catch {
    return iso
  }
}
