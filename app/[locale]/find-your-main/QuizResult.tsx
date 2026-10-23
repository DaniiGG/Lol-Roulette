'use client'

import { useCallback, useState } from 'react'
import { ArrowLeft, Check, Copy, Dices, Link2, RotateCcw, Share2, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import type { Answers, QuizOutcome, ScoredChampion } from '@/lib/quiz/types'
import { QUIZ_QUESTIONS } from '@/lib/quiz/questions'
import { quizChampionIcon, quizChampionSplash } from '@/lib/quiz/assets'

type Props = {
  answers: Answers
  outcome: QuizOutcome
  locale: string
  onRestart: () => void
  onReview: () => void
}

function formatTraitList(labels: string[], locale: string): string {
  try {
    return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(labels)
  } catch {
    return labels.join(', ')
  }
}

function buildShareUrl(answers: Answers): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('a', QUIZ_QUESTIONS.map((question) => answers[question.id]).join(','))
  return url.toString()
}

function copyWithFallback(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return Promise.resolve(copied)
  } catch {
    return Promise.resolve(false)
  }
}

function RecommendationCard({
  entry,
  label,
  reason,
}: {
  entry: ScoredChampion
  label: string
  reason: string
}) {
  const t = useTranslations('quiz')
  const champion = entry.champion

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-400/15" />
      <div className="relative flex items-start gap-4">
        <img
          src={quizChampionIcon(champion.ddragonKey)}
          alt={t('ui.imageAlt', { champion: champion.name })}
          width={72}
          height={72}
          loading="lazy"
          className="h-16 w-16 rounded-2xl border border-cyan-300/30 object-cover shadow-lg shadow-cyan-950/40 sm:h-20 sm:w-20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {label}
            </span>
            <span className="text-[11px] font-medium text-zinc-500">
              {t('ui.match', { percent: entry.matchPercent })}
            </span>
          </div>
          <h3 className="mt-2 truncate text-2xl font-semibold text-white">{champion.name}</h3>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            {t(`classes.${champion.championClass}`)} · {t(`roles.${champion.role}`)}
          </p>
        </div>
      </div>

      <p className="relative mt-4 text-sm font-medium text-[#e7c878]">
        {t(`champions.${champion.id}.title`)}
      </p>
      <p className="relative mt-2 text-sm leading-6 text-zinc-400">{reason}</p>
      <p className="relative mt-3 border-l border-cyan-400/30 pl-3 text-sm italic leading-6 text-zinc-500">
        {t(`champions.${champion.id}.quote`)}
      </p>
    </article>
  )
}

export default function QuizResult({ answers, outcome, locale, onRestart, onReview }: Props) {
  const t = useTranslations('quiz')
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [shareUrl, setShareUrl] = useState('')

  const main = outcome.main
  const champion = main.champion
  const role = t(`roles.${champion.role}`)
  const championClass = t(`classes.${champion.championClass}`)
  const traitLabels = outcome.topTraits.map((trait) => t(`traits.${trait}`))
  const traitList = formatTraitList(traitLabels, locale)
  const playstyle = t(`result.playstyle.${champion.championClass}`)
  const title = t(`champions.${champion.id}.title`)
  const quote = t(`champions.${champion.id}.quote`)

  const handleCopy = useCallback(async () => {
    const url = buildShareUrl(answers)
    setShareUrl(url)
    const copied = await copyWithFallback(url)
    setShareState(copied ? 'copied' : 'manual')
    if (copied) {
      window.setTimeout(() => setShareState('idle'), 2600)
    }
  }, [answers])

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(answers)
    setShareUrl(url)

    if (typeof navigator.share !== 'function') {
      await handleCopy()
      return
    }

    try {
      await navigator.share({
        title: t('ui.shareTitle', { champion: champion.name }),
        text: t('ui.shareMessage'),
        url,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      await handleCopy()
    }
  }, [answers, champion.name, handleCopy, t])

  return (
    <div className="mt-10" aria-live="polite">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#C89B3C]/30 bg-[#C89B3C]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c878]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {t('ui.resultReveal')}
        </span>
        <span className="text-xs text-zinc-600">{t('result.disclaimer')}</span>
      </div>

      <article
        aria-label={t('ui.resultAria')}
        className="relative isolate overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#05060b] shadow-[0_30px_120px_-40px_rgba(0,229,255,0.45)]"
      >
        <img
          src={quizChampionSplash(champion.ddragonKey)}
          alt={t('ui.imageAlt', { champion: champion.name })}
          className="absolute inset-0 h-full w-full object-cover object-[center_28%] opacity-75"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,3,5,0.35)_0%,rgba(3,3,5,0.75)_48%,rgba(3,3,5,0.98)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(0,229,255,0.22),transparent_35%),radial-gradient(circle_at_10%_70%,rgba(200,155,60,0.16),transparent_40%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

        <div className="relative flex min-h-[540px] flex-col justify-between p-5 sm:min-h-[620px] sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
                {t('ui.brand')}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/40">
                {t('navLabel')}
              </p>
            </div>
            <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              {t('ui.match', { percent: main.matchPercent })}
            </span>
          </div>

          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#C89B3C]/40 bg-[#C89B3C]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#f0d28a] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f0d28a]" />
              {t('ui.main')}
            </p>
            <h2
              className="text-6xl leading-[0.88] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] sm:text-8xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
            >
              {champion.name}
            </h2>
            <p className="mt-3 text-xl font-semibold text-[#e7c878] sm:text-2xl">{title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/55">
              {championClass} · {role}
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-200/90 sm:text-lg">
              “{quote}”
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
              {t('ui.footerTagline')}
            </p>
            <p className="text-[11px] font-medium text-cyan-200/80">{t('ui.shareCardFooter')}</p>
          </div>
        </div>
      </article>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            {t('ui.whyThis')}
          </p>
          <p className="mt-3 text-lg leading-8 text-zinc-200">
            {t('result.traitIntro', { traits: traitList })}
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            {t('result.mainWhy', {
              champion: champion.name,
              traits: traitList,
              class: championClass,
              role,
              playstyle,
            })}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {outcome.topTraits.map((trait) => (
              <span
                key={trait}
                className="rounded-full border border-cyan-300/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-medium text-cyan-100"
              >
                {t(`traits.${trait}`)}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#C89B3C]/20 bg-[#C89B3C]/5 p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e7c878]/80">
            {t('ui.topTraits')}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            {t('result.playstyleTitle', { champion: champion.name })}
          </h3>
          <p className="mt-3 text-base leading-7 text-zinc-300">{playstyle}.</p>
          <div className="mt-5 space-y-3">
            {outcome.topTraits.map((trait) => (
              <div key={trait} className="flex items-start gap-2.5 text-sm leading-6 text-zinc-400">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#e7c878]" aria-hidden="true" />
                <span>{t(`traits.insights.${trait}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-7">
        <h3 className="text-xl font-semibold text-white">{t('result.answerNotesTitle')}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {outcome.topTraits.map((trait) => (
            <div key={trait} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
                {t(`traits.${trait}`)}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{t(`traits.insights.${trait}`)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <RecommendationCard
          entry={outcome.alternate}
          label={t('ui.alternate')}
          reason={t('result.alternateWhy', {
            champion: outcome.alternate.champion.name,
            traits: traitList,
            role: t(`roles.${outcome.alternate.champion.role}`),
          })}
        />
        <RecommendationCard
          entry={outcome.wildcard}
          label={t('ui.wildcard')}
          reason={t('result.wildcardWhy', {
            champion: outcome.wildcard.champion.name,
            traits: traitList,
          })}
        />
      </div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-[#070912]/90 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070912]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('ui.restart')}
          </button>
          <button
            type="button"
            onClick={onReview}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('ui.review')}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {t('ui.share')}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            {shareState === 'copied' ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {shareState === 'copied' ? t('ui.copied') : t('ui.copy')}
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-zinc-500">{t('result.retakeHint')}</p>

        {shareState === 'manual' && (
          <div className="mt-4">
            <label htmlFor="quiz-share-url" className="text-xs font-medium text-zinc-400">
              {t('ui.copyLinkLabel')}
            </label>
            <input
              id="quiz-share-url"
              readOnly
              value={shareUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-cyan-400/50"
            />
            <p className="mt-2 text-xs text-zinc-500">{t('ui.copyFailed')}</p>
          </div>
        )}

        {shareState === 'copied' && (
          <p role="status" className="mt-4 text-xs font-medium text-emerald-400">
            {t('ui.copied')}
          </p>
        )}
      </section>

      <section className="relative mt-8 overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500/10 via-[#071018] to-[#0b0b12] p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              {t('ui.spinSub')}
            </p>
            <h3 className="mt-2 max-w-xl text-2xl font-semibold text-white sm:text-3xl">
              {t('ui.spin')}
            </h3>
          </div>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Dices className="h-4 w-4" aria-hidden="true" />
            {t('ui.backHome')}
          </Link>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-600 transition hover:text-zinc-300"
        >
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          {t('ui.shareCardFooter')}
        </Link>
      </div>
    </div>
  )
}
