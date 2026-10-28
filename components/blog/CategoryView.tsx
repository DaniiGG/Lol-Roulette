import { postsByCategory, sortByPublishedDesc } from '@/lib/blog/content'
import BlogPostCard from './BlogPostCard'
import { Link } from '@/i18n/navigation'
import type { BlogPost } from '@/lib/blog/content'
import { CATEGORIES, isCategorySlug } from '@/lib/blog/categories'
import { getBlogIndexHref, getCategoryHref } from '@/lib/blog/meta'
import Breadcrumbs from '@/components/Breadcrumbs'

interface CategoryViewProps {
  posts: BlogPost[]
  locale: string
  categorySlug: string
  t: ReturnType<typeof import('next-intl').useTranslations>
}

export default function CategoryView({ posts, locale, categorySlug, t }: CategoryViewProps) {
  const blogPath = getBlogIndexHref(locale)
  const categoryHref = (slug: string) => getCategoryHref(slug, locale)
  const catPosts = isCategorySlug(categorySlug) ? postsByCategory(posts, categorySlug) : []
  const sortedPosts = sortByPublishedDesc(catPosts)
  const otherCategories = CATEGORIES.filter(c => c.slug !== categorySlug)

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 pt-10 pb-12">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: t('blog'), href: '/blog' },
            { label: t(`categories.${categorySlug}.name`) },
          ]}
        />

        <header className="mb-12">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">
            {t('categoryLabel')}
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {t(`categories.${categorySlug}.name`)}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-neutral-300">
            {t(`categories.${categorySlug}.desc`)}
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label={t('filterByCategory')}>
          <a
            href={blogPath}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${'bg-[#C89B3C] text-neutral-950'}`}
          >
            {t('allLabel')}
          </a>
          {otherCategories.map(cat => (
            <a
              key={cat.slug}
              href={categoryHref(cat.slug)}
              className="px-4 py-2 rounded-full text-sm font-medium transition capitalize bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
            >
              {t(`categories.${cat.slug}.name`)}
            </a>
          ))}
        </div>

        {sortedPosts.length > 0 ? (
          <>
            {catPosts.length > 1 && (
              <article
                key="featured"
                className="mb-10"
              >
                <BlogPostCard post={sortedPosts[0]} locale={locale} featured={true} index={-1} />
              </article>
            )}
            <section>
              <h2 className="mb-5 text-2xl font-semibold text-white">
                {t('latestLabel')}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedPosts.slice(catPosts.length > 1 ? 1 : 0).map((post, idx) => (
                  <BlogPostCard key={post.slug} post={post} locale={locale} index={idx} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="text-center py-16 rounded-3xl border border-neutral-800 bg-neutral-900/50">
            <p className="text-neutral-400 text-lg">
              {t('noPostsInCategory')}
            </p>
          </div>
        )}

        <section className="mt-12 rounded-3xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-8">
          <h2 className="mb-3 text-2xl font-semibold text-white">
            {t('ctaMidTitle')}
          </h2>
          <p className="mb-6 max-w-3xl text-lg leading-8 text-neutral-300">
            {t('ctaMidDesc')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
          >
            {t('tryApp')}
          </Link>
        </section>
      </div>
    </main>
  )
}