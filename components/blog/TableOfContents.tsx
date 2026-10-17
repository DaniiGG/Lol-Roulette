'use client'

import { useEffect, useState, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

interface TableOfContentsProps {
  items: TocItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const t = useTranslations('blog')
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const headings = items.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[]
    if (!headings.length) return

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0px -66%',
        threshold: [0, 0.1, 0.5, 1]
      }
    )

    headings.forEach(h => observerRef.current?.observe(h))
    return () => observerRef.current?.disconnect()
  }, [items])

  if (!items.length) return null

  return (
    <nav className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2" aria-label={t('onThisPage')}>
      <div className="bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#C89B3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {t('onThisPage')}
        </h3>
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id} className={`pl-${item.level === 2 ? 0 : 4}`}>
              <a
                href={`#${item.id}`}
                className={`block py-1 text-sm transition-colors ${activeId === item.id
                  ? 'text-[#C89B3C] font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}