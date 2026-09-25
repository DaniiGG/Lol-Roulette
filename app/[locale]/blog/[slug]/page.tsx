import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { getHreflangAlternates } from '@/lib/seo-utils'
import { routing } from '@/i18n/routing'
import { BLOG_SLUGS, blogKeywords, BLOG_META, getLaneForSlug, getTagsForSlug } from "@/lib/blog-posts"

type BlogSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

type BlogPost = {
  slug: string
  title: string
  description: string
  excerpt: string
  ctaLabel: string
  heroIntro: string[]
  sections: BlogSection[]
}

type BlogPostPageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of routing.locales) {
    for (const slug of BLOG_SLUGS) {
      params.push({ locale, slug })
    }
  }
  return params
}

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const { locale, slug } = await props.params
  setRequestLocale(locale)
  const tAll = await getTranslations()

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blogContent') as BlogPost[]
  } catch {
    return {}
  }

  const post = blogPosts.find((p: BlogPost) => p.slug === slug)
  if (!post) return {}

  const meta = BLOG_META[slug] || { date: "2026-01-15", author: "League Roulette Team", lane: "all-lanes", tags: [] }
  const tags = getTagsForSlug(slug)
  const lane = getLaneForSlug(slug)

  return {
    title: `${post.title} | League Roulette Blog`,
    description: post.description,
    keywords: blogKeywords[slug] || [],
    authors: [{ name: meta.author, url: `https://leagueroulette.com/about` }],
    alternates: {
      canonical: locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`,
      languages: getHreflangAlternates(`/blog/${slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`,
      type: "article",
      siteName: "League Roulette",
      publishedTime: meta.date,
      authors: [`https://leagueroulette.com/about`],
      images: [{ url: "https://leagueroulette.com/og-image.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ['https://leagueroulette.com/og-image.png'],
      creator: '@LeagueRoulette',
    },
    other: {
      'article:section': lane,
      'article:tag': tags.join(', '),
    },
  }
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { locale, slug } = await props.params
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  const tAll = await getTranslations()

  let blogPosts: BlogPost[] = []
  try {
    blogPosts = tAll.raw('blogContent') as BlogPost[]
  } catch {
    blogPosts = []
  }

  const post = blogPosts.find((p: BlogPost) => p.slug === slug)
  if (!post) {
    notFound()
  }

  const meta = BLOG_META[slug] || { date: "2026-01-15", author: "League Roulette Team", lane: "all-lanes", tags: [] }
  const lane = getLaneForSlug(slug)
  const tags = getTagsForSlug(slug)

  const relatedPosts = blogPosts.filter((entry: BlogPost) => {
    if (entry.slug === post.slug) return false
    const entryLane = getLaneForSlug(entry.slug)
    return entryLane === lane || entryLane === 'all-lanes' || lane === 'all-lanes'
  }).slice(0, 4)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: meta.author,
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
    datePublished: meta.date,
    dateModified: new Date().toISOString().split("T")[0],
    mainEntityOfPage: `https://leagueroulette.com/blog/${post.slug}`,
    keywords: (blogKeywords[slug] || []).join(", "),
    image: "https://leagueroulette.com/og-image.png",
    articleSection: lane,
    tags: tags,
  }

  const isTutorial = slug.startsWith('how-to-');
  const howToSchema = isTutorial ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.title,
    description: post.description,
    totalTime: "PT15M",
    step: post.sections.map((section: { heading: string; paragraphs: string[] }) => ({
      "@type": "HowToStep",
      name: section.heading,
      text: section.paragraphs.join(' '),
    })),
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://leagueroulette.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://leagueroulette.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://leagueroulette.com/blog/${post.slug}` },
    ],
  };

  const allSchema: any[] = [
    { "@context": "https://schema.org", "@type": "WebSite", name: "League Roulette", url: "https://leagueroulette.com" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbSchema.itemListElement },
  ];
  if (isTutorial && howToSchema) allSchema.push(howToSchema);
  allSchema.push(articleSchema);
  const graphSchema = { "@context": "https://schema.org", "@graph": allSchema };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {isTutorial && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />}

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
            {post.heroIntro.map((paragraph: string) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        <div className="space-y-8">
          {post.sections.map((section: BlogSection) => (
            <section
              key={section.heading}
              className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8"
            >
              <h2 className="mb-4 text-3xl font-semibold text-white">
                {section.heading}
              </h2>
              <div className="space-y-4 text-lg leading-8 text-neutral-300">
                {section.paragraphs.map((paragraph: string) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-6 space-y-3 text-neutral-300">
                  {section.bullets.map((bullet: string) => (
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
              href="/"
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
            {relatedPosts.map((relatedPost: BlogPost) => (
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
