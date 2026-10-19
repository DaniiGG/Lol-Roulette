import Image from 'next/image'
import { getPostMeta } from '@/lib/blog/meta'
import { readingTime, formatDate } from '@/lib/blog/content'
import type {
  BlogPost,
  BlogSection,
  BlogFaqItem,
  BlogTable,
  BlogPatchTable,
  BlogCta,
  PatchChangeRow,
  ItemChangeRow,
  BlogSource,
} from '@/lib/blog/content'
import Link from 'next/link'

interface BlogPostContentProps {
  post: BlogPost
  locale: string
}

const DD_VERSION = '16.18.1'
const CHAMPION_IMG = (id: string) => `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${id}.png`
const ITEM_IMG = (id: string) => `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/item/${id}.png`

function patchImage(src: string, alt: string, className: string) {
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      loading="lazy"
      decoding="async"
      className={className}
    />
  )
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

function changeCellStyle(type: 'buff' | 'nerf' | 'adjustment' | undefined) {
  if (type === 'buff') return 'text-green-400'
  if (type === 'nerf') return 'text-red-400'
  return 'text-neutral-400'
}

function rowBg(type: 'buff' | 'nerf' | 'adjustment' | undefined, index: number) {
  const base = index % 2 === 0 ? 'bg-neutral-900/50' : 'bg-neutral-900'
  if (type === 'buff') return `${base} bg-green-500/5`
  if (type === 'nerf') return `${base} bg-red-500/5`
  return base
}

function iconCell(src: string, alt: string, type: 'buff' | 'nerf' | 'adjustment' | undefined) {
  const ring = type === 'buff' ? 'ring-1 ring-green-500/20' : type === 'nerf' ? 'ring-1 ring-red-500/20' : 'ring-1 ring-neutral-700'
  return (
    <td className="px-4 py-3 text-center">
      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-800 ${ring} bg-neutral-950`}>
        {patchImage(src, alt, 'w-8 h-8')}
      </span>
    </td>
  )
}

function renderPatchTable(table: BlogPatchTable, locale: string) {
  const isItems = table.kind === 'item-changes'
  const typeColor = table.kind === 'champion-buffs' ? 'buff' : table.kind === 'champion-nerfs' ? 'nerf' : 'adjustment'
  const es = locale === 'es'

  const championAlt = (name: string) => es ? `Retrato del campeón ${name}` : `${name} champion portrait`
  const itemAlt = (name: string) => es ? `Icono del objeto ${name}` : `${name} item icon`

  return (
    <div className="overflow-x-auto my-6 rounded-xl border border-neutral-800">
      <table className="w-full text-sm border-collapse">
        <caption className="sr-only">{table.headers[0]}</caption>
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
          {table.rows.map((row, ri) => {
            const r = row as PatchChangeRow & ItemChangeRow
            const isChampion = !isItems && 'championId' in r
            const trType = (r.type as 'buff' | 'nerf' | 'adjustment' | undefined) ?? typeColor
            const nameCell = isChampion
              ? (
                  <>
                    {iconCell(CHAMPION_IMG(r.championId), championAlt(r.name), trType)}
                    <span className="block font-semibold text-white">{r.name}</span>
                  </>
                )
              : (
                  <>
                    {iconCell(ITEM_IMG(r.itemId), itemAlt(r.name), trType)}
                    <span className="block font-semibold text-white">{r.name}</span>
                  </>
                )
            const statCell = isChampion ? r.ability : r.stat
            const changeCell = (
              <td
                key="change"
                className={`px-4 py-3 text-neutral-300 ${changeCellStyle(trType)} font-medium`}
              >
                {r.change}
              </td>
            )
            const impactCell = (
              <td key="impact" className="px-4 py-3 text-neutral-400 text-sm">
                {r.impact}
              </td>
            )
            return (
              <tr key={ri} className={`${rowBg(trType, ri)} border-b border-neutral-800/50`}>
                <td key="name" className="px-4 py-3 text-neutral-300">
                  {nameCell}
                </td>
                {isChampion
                  ? [
                      <td key="ability" className="px-4 py-3 text-neutral-300 text-sm">
                        {statCell}
                      </td>,
                      <td key="before" className="px-4 py-3 text-neutral-300 text-sm">
                        {r.before}
                      </td>,
                      <td key="after" className="px-4 py-3 text-neutral-300 text-sm">
                        {r.after}
                      </td>,
                      changeCell,
                      impactCell,
                    ]
                  : [
                      <td key="stat" className="px-4 py-3 text-neutral-300 text-sm">
                        {statCell}
                      </td>,
                      <td key="before" className="px-4 py-3 text-neutral-300 text-sm">
                        {r.before}
                      </td>,
                      <td key="after" className="px-4 py-3 text-neutral-300 text-sm">
                        {r.after}
                      </td>,
                      changeCell,
                      impactCell,
                    ]}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function renderCtaBox(cta: BlogCta, paragraphs: string[] | undefined, locale: string) {
  return (
    <section className="mt-10 rounded-3xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-8" aria-labelledby="patch-cta-heading">
      <h2 id="patch-cta-heading" className="mb-4 text-2xl font-semibold text-white">
        {cta.label}
      </h2>
      <div className="space-y-4 text-neutral-300 leading-relaxed">
        {paragraphs?.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <Link
        href={cta.href}
        className="inline-flex items-center rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
      >
        {locale === 'es' ? 'Gira la ruleta' : 'Spin the roulette'}
      </Link>
    </section>
  )
}

function renderSources(sources: BlogSource[]) {
  return (
    <section className="mt-10 rounded-xl border border-neutral-800 bg-neutral-900/80 p-6" aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="mb-4 text-xl font-semibold text-white">
        Sources
      </h2>
      <ul className="space-y-2 text-sm text-neutral-400">
        {sources.map((s, i) => (
          <li key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C89B3C] hover:underline transition"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
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
            {!section.cta && (
              <div className="space-y-5 text-lg leading-relaxed text-neutral-300">
                {section.paragraphs?.map((paragraph, pi) => (
                  <p key={pi}>{paragraph}</p>
                ))}
              </div>
            )}
            {section.bullets?.length && renderBullets(section.bullets)}
            {section.table && renderTable(section.table)}
            {section.patchTable && renderPatchTable(section.patchTable, locale)}
            {section.cta && renderCtaBox(section.cta, section.paragraphs, locale)}
          </section>
        ))}
        {post.faq?.length && renderFaq(post.faq, locale)}
        {post.sources?.length && renderSources(post.sources)}
      </div>
    </article>
  )
}