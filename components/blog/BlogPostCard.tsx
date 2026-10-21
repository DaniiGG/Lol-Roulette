'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { getPostMeta, getAvailableLocales, getPostHref, getImageAlt } from '@/lib/blog/meta'
import { readingTime, formatDate } from '@/lib/blog/content'
import type { BlogPost } from '@/lib/blog/content'
import { CATEGORIES } from '@/lib/blog/categories'

interface BlogPostCardProps {
  post: BlogPost
  locale: string
  featured?: boolean
  index?: number
}

export default function BlogPostCard({ post, locale, featured = false, index = 0 }: BlogPostCardProps) {
  const t = useTranslations('blog')
  const meta = getPostMeta(post.slug)
  const availableLocales = getAvailableLocales(post.slug)
  const rt = readingTime(post)
  const postHref = getPostHref(post.slug, locale)
  const publishedDate = formatDate(meta?.publishedAt ?? '', locale)
  const updatedDate = meta?.updatedAt ? formatDate(meta.updatedAt, locale) : null

  const category = meta?.category
  const catInfo = category ? CATEGORIES.find(c => c.slug === category) : undefined

  return (
    <article
      className={`group flex flex-col rounded-3xl border border-neutral-800 bg-neutral-900/80 overflow-hidden transition-all duration-300 ${featured
        ? 'md:flex-row md:max-w-4xl'
        : 'h-full'
      } ${index >= 0 ? `stagger-children` : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative w-full md:w-72 md:flex-shrink-0 aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C89B3C]/20 via-transparent to-cyan-500/10" />
        {meta?.image ? (
          <Image
            src={meta.image}
            alt={getImageAlt(post.slug, locale) ?? post.title}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 288px' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
              {catInfo?.name.includes('Champion') ? '⚔️' :
                catInfo?.name.includes('Guide') ? '📖' :
                catInfo?.name.includes('Tier') ? '🏆' :
                catInfo?.name.includes('Beginner') ? '🌱' :
                catInfo?.name.includes('Ranked') ? '📈' :
                catInfo?.name.includes('Mechanic') ? '⚙️' :
                '🎲'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-neutral-900/90 backdrop-blur text-xs font-medium text-[#C89B3C] border border-[#C89B3C]/30">
            {catInfo?.name ?? 'Article'}
          </span>
          {availableLocales.length > 1 && (
            <span className="px-2.5 py-1 rounded-full bg-neutral-900/90 backdrop-blur text-xs font-medium text-neutral-400">
              {availableLocales.map(l => l.toUpperCase()).join(', ')}
            </span>
          )}
        </div>
      </div>

      <div className={`flex flex-col p-6 ${featured ? 'md:flex-1 justify-between' : 'flex-1'}`}>
        <div className="mb-4">
          <h2 className={`font-semibold text-white line-clamp-2 ${featured ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`}>
            <Link href={postHref} className="hover:text-[#C89B3C] transition-colors">
              {post.title}
            </Link>
          </h2>
        </div>

        <p className={`text-neutral-300 line-clamp-3 mb-4 ${featured ? 'text-lg md:text-xl' : 'text-base'}`}>
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
          <time dateTime={meta?.publishedAt ?? ''}>
            <span className="hidden sm:inline">{publishedDate}</span>
            <span className="sm:hidden">{publishedDate}</span>
          </time>
          {updatedDate && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={meta?.updatedAt ?? ''} className="hidden sm:inline">
                {t('updated')}: {updatedDate}
              </time>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {rt} {t('readTime', { n: rt })}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800/50 flex items-center justify-between">
          <Link
            href={postHref}
            className={`inline-flex items-center gap-2 font-semibold transition ${featured
              ? 'text-lg px-5 py-3 rounded-xl bg-[#C89B3C] text-neutral-950 hover:bg-[#d9aa44]'
              : 'text-base px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 hover:text-[#C89B3C]'
            }`}
          >
            {t('readArticle')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}