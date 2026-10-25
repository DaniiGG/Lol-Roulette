import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, BookOpen, ChevronRight, Dices, ListChecks, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getBreadcrumbSchema, getHreflangAlternates } from '@/lib/seo-utils'
import Breadcrumbs from '@/components/Breadcrumbs'
import FindYourMainClient from './FindYourMainClient'

type PageParams = { locale: string }

const PAGE_PATH = '/find-your-main'

function localizedPath(locale: string): string {
  return locale === 'en' ? PAGE_PATH : `/${locale}${PAGE_PATH}`
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('quiz')
  const path = localizedPath(locale)

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: path,
      languages: getHreflangAlternates(PAGE_PATH),
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: path,
      siteName: 'League Roulette',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('intro.title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
      images: ['/og-image.png'],
      creator: '@LeagueRoulette',
    },
  }
}

export default async function FindYourMainPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('quiz')
  const faqItems = t.raw('intro.faq') as Array<{ q: string; a: string }>

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'League Roulette', path: locale === 'en' ? '/' : `/${locale}` },
    { name: t('navLabel'), path: localizedPath(locale) },
  ])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030305] pb-20 pt-10 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_50%_-10%,rgba(0,229,255,0.18),transparent_58%),radial-gradient(circle_at_88%_18%,rgba(200,155,60,0.1),transparent_38%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: t('navLabel') },
          ]}
        />

        <header className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#C89B3C]/30 bg-[#C89B3C]/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#e7c878]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t('intro.eyebrow')}
          </p>

          <h1 className="mt-6 text-balance">
            <span
              className="block bg-gradient-to-b from-white via-white to-cyan-200/70 bg-clip-text text-6xl leading-[0.9] text-transparent drop-shadow-[0_10px_40px_rgba(0,229,255,0.18)] sm:text-8xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
            >
              {t('intro.title')}
            </span>
            <span className="mx-auto mt-4 block max-w-3xl text-xl font-semibold leading-tight text-zinc-200 sm:text-3xl">
              {t('intro.h1')}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            {t('intro.subtitle')}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
            {t('intro.lead')}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#quiz"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 text-sm font-black text-zinc-950 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              {t('intro.start')}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-zinc-300 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:w-auto"
            >
              <Dices className="h-4 w-4" aria-hidden="true" />
              {t('intro.rouletteLink')}
            </Link>
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-zinc-600">
            {t('intro.noLogin')}
          </p>
        </header>

        <FindYourMainClient />

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              {t('intro.howTitle')}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              {t('intro.h1')}
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{t('intro.howText')}</p>
          </div>

          <div className="rounded-3xl border border-[#C89B3C]/20 bg-[#C89B3C]/5 p-6 sm:p-8">
            <ListChecks className="h-6 w-6 text-[#e7c878]" aria-hidden="true" />
            <p className="mt-4 text-sm leading-7 text-zinc-300">{t('intro.howDisclaimer')}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['aggression', 'creativity', 'teamwork', 'control', 'mobility', 'protection'].map((trait) => (
                <span
                  key={trait}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-400"
                >
                  {t(`traits.${trait}`)}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">FAQ</p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{t('intro.faqTitle')}</h2>
            </div>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 open:bg-white/[0.04]">
                <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-200 marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-zinc-600 transition group-open:rotate-90" aria-hidden="true">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white">{t('links.title')}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link
              href="/tierlist"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-cyan-300/30 hover:bg-cyan-400/5"
            >
              <ListChecks className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-zinc-200 group-hover:text-white">{t('links.tierlist')}</p>
            </Link>
            <Link
              href="/blog/champions"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#C89B3C]/30 hover:bg-[#C89B3C]/5"
            >
              <BookOpen className="h-5 w-5 text-[#e7c878]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-zinc-200 group-hover:text-white">{t('links.guides')}</p>
            </Link>
            <Link
              href="/howtoplay"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-emerald-300/30 hover:bg-emerald-400/5"
            >
              <Sparkles className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-zinc-200 group-hover:text-white">{t('links.howToPlay')}</p>
            </Link>
          </div>
        </section>

        <p className="mt-12 text-center text-xs leading-6 text-zinc-600">{t('result.disclaimer')}</p>
      </div>
    </main>
  )
}
