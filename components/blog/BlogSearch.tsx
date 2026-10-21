'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { BlogPost } from '@/lib/blog/content'
import { getPostMeta, getPostHref } from '@/lib/blog/meta'

interface BlogSearchProps {
  posts: BlogPost[]
  locale: string
}

export default function BlogSearch({ posts, locale }: BlogSearchProps) {
  const t = useTranslations('blog')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set<string>()
    posts.forEach(p => {
      const meta = getPostMeta(p.slug)
      if (meta?.category) cats.add(meta.category)
    })
    return Array.from(cats).sort()
  }, [posts])

  const filteredPosts = useMemo(() => {
    let result = posts
    const q = query.trim().toLowerCase()
    if (q.length >= 2) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      )
    }
    if (selectedCategory !== 'all') {
      result = result.filter(p => getPostMeta(p.slug)?.category === selectedCategory)
    }
    return result.slice(0, 8)
  }, [query, selectedCategory, posts])

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-12 pr-4 py-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:border-[#C89B3C]/50 focus:ring-1 focus:ring-[#C89B3C]/30 focus:outline-none transition"
          aria-label={t('searchLabel')}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label={t('filterByCategory')}>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === 'all'
            ? 'bg-[#C89B3C] text-neutral-950'
            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          {t('allLabel')}
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${selectedCategory === cat
              ? 'bg-[#C89B3C] text-neutral-950'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            {t(`categories.${cat}.name`)}
          </button>
        ))}
      </div>

      {query.length >= 2 && (
        <div className="mt-6 animate-slide-up" role="region" aria-label={t('searchResults')}>
          <p className="text-sm text-neutral-500 mb-3">
            {filteredPosts.length === 0
              ? t('searchNoResults', { query })
              : t('searchResultsCount', { count: filteredPosts.length })}
          </p>
          {filteredPosts.length > 0 && (
            <ul className="space-y-2">
              {filteredPosts.map(post => (
                <li key={post.slug}>
                  <Link
                    href={getPostHref(post.slug, locale)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50 hover:border-[#C89B3C]/30 hover:bg-neutral-900 transition"
                    onClick={() => setQuery('')}
                  >
                    <span className="mt-1 text-[#C89B3C] text-lg">→</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{post.title}</h4>
                      <p className="text-sm text-neutral-400 truncate mt-1">{post.excerpt}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}