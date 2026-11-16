// app/faq/page.tsx
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildPageMetadata, localizedAbsoluteUrl } from '@/lib/seo/page-metadata'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Link } from '@/i18n/navigation'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('page-seo')

  return buildPageMetadata({
    locale,
    path: '/faq',
    title: t('faq.title'),
    description: t('faq.description'),
  })
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('faq')
  const tAll = await getTranslations()
  const faqContent = tAll.raw('faqContent') as { q: string; a: string }[]
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqContent.map(({ q, a }) => ({
      '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'League Roulette', item: localizedAbsoluteUrl(locale, '/') },
      { '@type': 'ListItem', position: 2, name: t('title'), item: localizedAbsoluteUrl(locale, '/faq') },
    ],
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6 pb-12 pt-10">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: t('title') },
          ]}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-neutral-400">{t('subtitle')}</p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          
          {/* Getting Started (0-3) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionGettingStarted')}</h2>
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Gameplay (4-6) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionGameplay')}</h2>
            <div className="space-y-4">
              {[4, 5, 6].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Verification & Progress (7-9) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionVerification')}</h2>
            <div className="space-y-4">
              {[7, 8, 9].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Achievements & Leaderboards (10-11) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionAchievements')}</h2>
            <div className="space-y-4">
              {[10, 11].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Technical & Account (12-13) */}
          <section>
            <h2 className="text-3xl font-bold text-[#C89B3C] mb-6">{t('sectionTechnical')}</h2>
            <div className="space-y-4">
              {[12, 13].map((i) => (
                <details key={i} className="group p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                  <summary className="cursor-pointer text-xl font-semibold text-white list-none flex justify-between items-center">
                    {faqContent[i].q}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 text-neutral-300 leading-relaxed">
                    {faqContent[i].a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Still Have Questions */}
          <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#C89B3C]/20 to-transparent border border-[#C89B3C]/50">
            <h2 className="text-3xl font-bold text-white mb-4">{t('stillQuestions')}</h2>
            <p className="text-neutral-300 text-lg mb-6">
              {t('stillQuestionsDesc')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl bg-[#C89B3C] text-neutral-950 font-bold hover:bg-[#d9aa44] transition text-lg"
              >
                {t('contactSupport')}
              </Link>
              <Link
                href="/howtoplay"
                className="px-8 py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition text-lg"
              >
                {t('readTutorial')}
              </Link>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}