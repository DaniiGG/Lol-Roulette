'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Link2 } from 'lucide-react'

const logos = {
  WhatsApp: <path fill="currentColor" d="M12 1a10.93 10.93 0 0 0-9.42 16.49L1 23l5.65-1.48A11 11 0 1 0 12 1Zm0 20a9.1 9.1 0 0 1-4.62-1.26l-.33-.2-3.36.88.9-3.28-.22-.34A9.1 9.1 0 1 1 12 21Zm5-6.72c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.85 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.81-.72-1.36-1.6-1.52-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.61-1.47-.83-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.12 2.81c.14.18 1.92 2.94 4.65 4.12.65.28 1.16.45 1.56.57.65.21 1.25.18 1.72.11.52-.08 1.59-.65 1.82-1.29.23-.64.23-1.18.16-1.3-.07-.11-.25-.18-.52-.32Z" />,
  Reddit: <>
    <path d="m12 8 1.2-4.8 4.2 1M4.4 11.4a2.1 2.1 0 1 0-1.1 3.8m16.3-3.8a2.1 2.1 0 1 1 1.1 3.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="19.2" cy="4.6" r="2" fill="currentColor" />
    <ellipse cx="12" cy="14.6" rx="8.7" ry="5.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="8.7" cy="14" r="1.25" fill="currentColor" /><circle cx="15.3" cy="14" r="1.25" fill="currentColor" />
    <path d="M9 17c1.5 1.35 4.5 1.35 6 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>,
  Facebook: <path fill="currentColor" d="M14 22v-9h3l.45-3.5H14V7.3c0-1.01.28-1.7 1.74-1.7h1.85V2.47a24 24 0 0 0-2.7-.14c-2.67 0-4.49 1.63-4.49 4.63V9.5H7.4V13h3v9H14Z" />,
  Telegram: <path fill="currentColor" d="M21.5 3.4 2.7 10.7c-1.28.51-1.27 1.23-.23 1.55l4.83 1.51L18.5 6.7c.53-.32 1-.15.6.2l-9.1 8.2-.35 4.95c.52 0 .75-.24 1.04-.52l2.32-2.26 4.83 3.57c.9.5 1.55.24 1.77-.84l3.19-15.02c.32-1.32-.51-1.91-1.29-1.58Z" />,
  X: <path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-7.4L5.4 22H2.2l7.9-9.1L2 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.6 3.9H5.8L17.8 20Z" />,
}

const colors: Record<keyof typeof logos, string> = {
  WhatsApp: '#25D366',
  Reddit: '#FF673F',
  Facebook: '#6CA6FF',
  Telegram: '#42BEF1',
  X: '#EFEFF2',
}

const buttonStyle = 'inline-flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] transition hover:-translate-y-0.5 hover:border-current hover:bg-white/[0.085] motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c47f]'

export default function RouletteShare({ url }: { url: string }) {
  const t = useTranslations('rouletteShare')
  const title = useTranslations('page-seo')('home.title')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle')
  const link = encodeURIComponent(url)
  const text = encodeURIComponent(title)
  const hrefs: Record<keyof typeof logos, string> = {
    WhatsApp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + url)}`,
    Reddit: `https://www.reddit.com/submit?url=${link}&title=${text}`,
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
    Telegram: `https://t.me/share/url?url=${link}&text=${text}`,
    X: `https://twitter.com/intent/tweet?url=${link}&text=${text}`,
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopyState('copied')
    } catch {
      setCopyState('manual')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[576px] rounded-xl border border-[#c89b3c]/15 bg-[#11131a]/75 px-3 py-3 sm:px-4">
      <div role="group" aria-label={t('label')} className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#d6c08c]">{t('label')}</span>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(logos) as (keyof typeof logos)[]).map(name => (
            <a key={name} href={hrefs[name]} target="_blank" rel="noopener noreferrer" aria-label={name} title={name} className={buttonStyle} style={{ color: colors[name] }}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[19px]">{logos[name]}</svg>
            </a>
          ))}
          <button type="button" onClick={copyLink} aria-label={t('copy')} title={t('copy')} className={buttonStyle + ' text-[#e4c479]'}>
            {copyState === 'copied' ? <Check size={18} aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <span role="status" className="sr-only">{copyState === 'copied' ? t('copied') : ''}</span>
      {copyState === 'manual' && (
        <input aria-label={t('copy')} className="mt-2 w-full rounded-md border border-white/15 bg-black/30 p-2 text-xs text-neutral-200" value={url} readOnly onFocus={event => event.currentTarget.select()} />
      )}
    </div>
  )
}
