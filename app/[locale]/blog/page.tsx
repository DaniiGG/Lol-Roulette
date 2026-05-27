import Link from "next/link"
import { getTranslations } from 'next-intl/server'
import { blogIndexMetadata, blogPosts } from "@/lib/blog-posts"

export const metadata = blogIndexMetadata

export default async function BlogIndexPage() {
  const t = await getTranslations('blog')

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
          >
            <span aria-hidden="true">←</span>
            {t('back')}
          </Link>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">
              {t('sectionLabel')}
            </p>
            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {t('title')}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-neutral-300">
              {t('desc')}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="flex h-full flex-col rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
                {t('cardLabel')}
              </p>
              <h2 className="mb-3 text-2xl font-semibold text-white">
                {post.title}
              </h2>
              <p className="mb-6 flex-1 leading-7 text-neutral-400">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex w-fit items-center rounded-xl bg-[#C89B3C] px-4 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
              >
                {t('readArticle')}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}