import { getPostMeta } from '@/lib/blog/meta'
import { readingTime, formatDate } from '@/lib/blog/content'
import type { BlogPost, BlogSection, BlogFaqItem, BlogTable } from '@/lib/blog/content'
import Link from 'next/link'

interface BlogPostContentProps {
  post: BlogPost
  locale: string
}

function renderTable(table: BlogTable) {
  return (
    <div className="overflow-x-auto my-6 rounded-xl border border-neutral-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-900 border-b border-neutral-800">
            {table.headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className={`${ri % 2 === 0 ? 'bg-neutral-900/50' : 'bg-neutral-900'} border-b border-neutral-800/50`}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-neutral-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderBullets(bullets: string[]) {
  return (
    <ul className="mt-4 space-y-2.5 pl-6">
      {bullets.map((bullet, i) => (
        <li key={i} className="flex gap-3 text-neutral-300 leading-relaxed">
          <span className="text-[#C89B3C] mt-0.5 flex-shrink-0">•</span>
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  )
}

function renderFaq(faq: BlogFaqItem[], locale: string) {
  const t = { q: 'Q', a: 'A' }
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-8" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="mb-6 text-2xl font-semibold text-white">
          {t.q}
        </h2>
        <div className="space-y-4">
          {faq.map((item, i) => (
            <details key={i} className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
              <summary className="flex items-center gap-3 font-semibold text-white cursor-pointer list-none">
                <span className="text-[#C89B3C]">Q:</span>
                {item.q}
                <svg className="ml-auto w-5 h-5 text-neutral-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-neutral-300 leading-relaxed">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}

export default function BlogPostContent({ post, locale }: BlogPostContentProps) {
  const meta = getPostMeta(post.slug)
  const rt = readingTime(post)
  const publishedDate = formatDate(meta?.publishedAt ?? '', locale)
  const updatedDate = meta?.updatedAt ? formatDate(meta.updatedAt, locale) : null

  // Generate TOC items from sections
  const tocItems = post.sections
    .filter(s => s.heading.trim())
    .map((section, i) => ({
      id: `section-${i}`,
      text: section.heading,
      level: 2 as const
    }))

  return (
    <article className="prose prose-invert prose-neutral max-w-none">
      <div className="space-y-8">
        {post.sections.map((section: BlogSection, i) => (
          <section
            key={section.heading}
            id={`section-${i}`}
            className="scroll-mt-24"
          >
            <h2 className="mb-4 scroll-mt-24 text-3xl font-semibold text-white border-b border-neutral-800 pb-3">
              {section.heading}
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-neutral-300">
              {section.paragraphs?.map((paragraph, pi) => (
                <p key={pi}>{paragraph}</p>
              ))}
            </div>
            {section.bullets?.length && renderBullets(section.bullets)}
            {section.table && renderTable(section.table)}
          </section>
        ))}
        {post.faq?.length && renderFaq(post.faq, locale)}
      </div>
    </article>
  )
}