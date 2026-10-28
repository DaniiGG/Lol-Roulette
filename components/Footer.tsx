'use client'

import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const tQuiz = useTranslations('quiz')
  const locale = useLocale()
  const hasMasteryTree = locale === 'en' || locale === 'es'
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-800/50 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-bold text-white">{tNav('siteName')}</h3>
            <p className="text-sm leading-relaxed text-neutral-400">
              {t('description')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/find-your-main" className="text-neutral-400 transition hover:text-white">
                  {tQuiz('navLabel')}
                </Link>
              </li>
              {hasMasteryTree && (
                <li>
                  <Link href="/mastery-tree" className="text-neutral-400 transition hover:text-white">
                    {tNav('masteryTree')}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/blog" className="text-neutral-400 transition hover:text-white">
                  {tNav('blog')}
                </Link>
              </li>
              <li>
                <Link href="/howtoplay" className="text-neutral-400 transition hover:text-white">
                  {tNav('howToPlay')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-400 transition hover:text-white">
                  {tNav('about')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-400 transition hover:text-white">
                  {tNav('faq')}
                </Link>
              </li>
              <li>
                <Link href="/tips" className="text-neutral-400 transition hover:text-white">
                  {tNav('tips')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">{t('legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-neutral-400 transition hover:text-white">
                  {tNav('contact')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-400 transition hover:text-white">
                  {tNav('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-400 transition hover:text-white">
                  {tNav('terms')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">{t('followUs')}</h4>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/LeagueRoulette"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 transition hover:bg-neutral-700 hover:text-white"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800/50 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-xs text-neutral-600 md:text-left">
              {t('copyright', { year })}
            </p>

            <p className="max-w-2xl text-center text-xs text-neutral-600 md:text-right">
              {t('disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}