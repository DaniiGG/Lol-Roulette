import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { blogPosts, getBlogMetadata, getBlogPost } from "@/lib/blog-posts"
import { getTranslations } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'

type BlogPostPageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const { locale, slug } = await props.params
  const post = getBlogPost(slug)

  if (!post) {
    return {}
  }

  const base = getBlogMetadata(post)
  return {
    ...base,
    alternates: {
      canonical: locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`,
      languages: getHreflangAlternates(`/blog/${slug}`),
    },
  }
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params
  const post = getBlogPost(slug)
  const t = await getTranslations('blog')

  if (!post) {
    notFound()
  }

  const relatedPosts = blogPosts.filter((entry) => entry.slug !== post.slug)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: "League Roulette Team",
      url: "https://leagueroulette.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "League Roulette",
      logo: {
        "@type": "ImageObject",
        url: "https://leagueroulette.com/og-image.png",
      },
    },
    datePublished: "2026-01-15",
    dateModified: new Date().toISOString().split("T")[0],
    mainEntityOfPage: `https://leagueroulette.com/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
    image: "https://leagueroulette.com/og-image.png",
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="mx-auto max-w-4xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          {t('backToBlog')}
        </Link>

        <header className="mb-10 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C89B3C]">
            {t('guideLabel')}
          </p>
          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {post.title}
          </h1>
          <div className="space-y-5 text-lg leading-8 text-neutral-300">
            {post.heroIntro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        <div className="space-y-8">
          {post.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8"
            >
              <h2 className="mb-4 text-3xl font-semibold text-white">
                {section.heading}
              </h2>
              <div className="space-y-4 text-lg leading-8 text-neutral-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-6 space-y-3 text-neutral-300">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-lg leading-8">
                      <span className="text-[#C89B3C]">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-8">
          <h2 className="mb-3 text-3xl font-semibold text-white">
            {t('ctaTitle')}
          </h2>
          <p className="mb-6 max-w-3xl text-lg leading-8 text-neutral-300">
            {t('ctaDesc')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={post.ctaHref}
              className="rounded-xl bg-[#C89B3C] px-5 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
            >
              {post.ctaLabel}
            </Link>
            <Link
              href="/blog"
              className="rounded-xl bg-neutral-800 px-5 py-3 font-semibold text-white transition hover:bg-neutral-700"
            >
              {t('browseMore')}
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            {t('relatedReading')}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={`/blog/${relatedPost.slug}`}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-[#C89B3C]/40 hover:bg-neutral-900/80"
              >
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {relatedPost.title}
                </h3>
                <p className="leading-7 text-neutral-400">
                  {relatedPost.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
