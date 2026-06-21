'use client'

import { useTranslations } from 'next-intl'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is League Roulette free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes! League Roulette is completely free to use. You can spin the roulette without creating an account, or login to track your progress and compete.' },
    },
    {
      '@type': 'Question',
      name: 'How does match verification work?',
      acceptedAnswer: { '@type': 'Answer', text: 'We use Riot Games official API to verify that you played and won with the assigned champion. Your match data is fetched securely and privately.' },
    },
    {
      '@type': 'Question',
      name: 'Can I filter champions by lane?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes! You can select your preferred lane (Top, Jungle, Mid, ADC, Support) and get a random champion that fits that role.' },
    },
    {
      '@type': 'Question',
      name: 'Is this affiliated with Riot Games?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. League Roulette is an independent fan-made project and is not endorsed by Riot Games.' },
    },
    {
      '@type': 'Question',
      name: 'Does it include all Season 2026 champions?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes! Updated for Season 2026 with all League of Legends champions including new releases.' },
    },
    {
      '@type': 'Question',
      name: 'Is it good for ARAM random champion generator?',
      acceptedAnswer: { '@type': 'Answer', text: 'Perfect for ARAM! Filter by role and get random picks that work great in Howling Abyss chaos.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use random champion picker for ranked?',
      acceptedAnswer: { '@type': 'Answer', text: 'Absolutely! Many players use it to practice off-meta picks and improve their champion pool for ranked climb.' },
    },
    {
      '@type': 'Question',
      name: 'Is League Roulette mobile optimized?',
      acceptedAnswer: { '@type': 'Answer', text: '100% mobile-friendly. Spin the roulette on phone, tablet, or desktop. Perfect for queue times!' },
    },
  ],
}

export default function SEOContent() {
  const t = useTranslations('seo')
  const features = t.raw('features') as string[]
  const howToSteps = t.raw('howToSteps') as string[]
  const whyBullets = t.raw('whyBullets') as string[]

  return (
    <div className="max-w-4xl mx-auto mt-16 mb-8 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1 className="sr-only">
        {t('srHeading')}
      </h1>

      <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-8 space-y-6 text-neutral-300">

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('whatIsTitle')}
          </h2>
          <p className="leading-relaxed">
            {t.rich('whatIsText', { strong: (chunks) => <strong>{chunks}</strong> })}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('howToTitle')}
          </h2>
          <ol className="list-decimal ml-6 space-y-2">
            {howToSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('featuresTitle')}
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <li key={i}>✅ {f}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('whyTitle')}
          </h2>
          <p className="leading-relaxed">
            {t('whyText')}
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {whyBullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('perfectTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">{t('perfectAramTitle')}</h3>
              <p className="text-neutral-300">{t('perfectAramText')}</p>
            </div>
            <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">{t('perfectRankedTitle')}</h3>
              <p className="text-neutral-300">{t('perfectRankedText')}</p>
            </div>
            <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="text-xl font-semibold text-[#C89B3C] mb-3">{t('perfectCustomTitle')}</h3>
              <p className="text-neutral-300">{t('perfectCustomText')}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('challengesTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <h3 className="font-semibold text-white mb-2">{t('challenge1Title')}</h3>
              <p className="text-neutral-300 text-sm">{t('challenge1Text')}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
              <h3 className="font-semibold text-white mb-2">{t('challenge2Title')}</h3>
              <p className="text-neutral-300 text-sm">{t('challenge2Text')}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <h3 className="font-semibold text-white mb-2">{t('challenge3Title')}</h3>
              <p className="text-neutral-300 text-sm">{t('challenge3Text')}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30">
              <h3 className="font-semibold text-white mb-2">{t('challenge4Title')}</h3>
              <p className="text-neutral-300 text-sm">{t('challenge4Text')}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('faqTitle')}
          </h2>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i}>
                <h3 className="font-semibold text-white mb-2">
                  {t(`faq${i}Q`)}
                </h3>
                <p>
                  {t(`faq${i}A`)}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
