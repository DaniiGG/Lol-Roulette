'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, Check, Crown, Eye, Flame, Gamepad2, Moon, Skull, Sparkles, Swords } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { QUIZ_QUESTIONS } from '@/lib/quiz/questions'
import { QUIZ_CHAMPIONS } from '@/lib/quiz/champions'
import { isCompleteAnswers, scoreAnswers } from '@/lib/quiz/scoring'
import type { Answers } from '@/lib/quiz/types'
import QuizResult from './QuizResult'

const QUESTION_ICONS = [Moon, Swords, Flame, Sparkles, Skull, Gamepad2, Eye, Crown]

const ACCENTS = [
  {
    icon: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200',
    line: 'from-cyan-400/80 via-cyan-300/20 to-transparent',
    dot: 'bg-cyan-300',
    glow: 'bg-cyan-500/10',
  },
  {
    icon: 'border-[#C89B3C]/40 bg-[#C89B3C]/10 text-[#f0d28a]',
    line: 'from-[#C89B3C]/80 via-[#C89B3C]/20 to-transparent',
    dot: 'bg-[#e7c878]',
    glow: 'bg-[#C89B3C]/10',
  },
  {
    icon: 'border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-200',
    line: 'from-fuchsia-400/80 via-fuchsia-300/20 to-transparent',
    dot: 'bg-fuchsia-300',
    glow: 'bg-fuchsia-500/10',
  },
  {
    icon: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200',
    line: 'from-emerald-400/80 via-emerald-300/20 to-transparent',
    dot: 'bg-emerald-300',
    glow: 'bg-emerald-500/10',
  },
]

function parseSharedAnswers(raw: string): Answers | null {
  const selected = raw.split(',').map((value) => value.trim())
  if (selected.length !== QUIZ_QUESTIONS.length) return null

  const answers: Answers = {}

  for (const answerId of selected) {
    const question = QUIZ_QUESTIONS.find((entry) =>
      entry.options.some((option) => option.id === answerId)
    )
    if (!question || answers[question.id]) return null
    answers[question.id] = answerId
  }

  return isCompleteAnswers(answers, QUIZ_QUESTIONS) ? answers : null
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function FindYourMainClient() {
  const t = useTranslations('quiz')
  const locale = useLocale()
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [invalidShare, setInvalidShare] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const quizRef = useRef<HTMLDivElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const advanceTimer = useRef<number | null>(null)
  const hasInteracted = useRef(false)

  const total = QUIZ_QUESTIONS.length
  const question = QUIZ_QUESTIONS[step]
  const selectedOption = question ? answers[question.id] : undefined
  const outcome = useMemo(
    () => scoreAnswers(answers, QUIZ_QUESTIONS, QUIZ_CHAMPIONS),
    [answers]
  )

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('a')
    if (!raw) return

    const shared = parseSharedAnswers(raw)
    if (!shared) {
      window.setTimeout(() => setInvalidShare(true), 0)
      return
    }

    window.setTimeout(() => {
      setAnswers(shared)
      setStep(total - 1)
      setShowResults(true)
    }, 0)
  }, [total])

  useEffect(() => {
    if (!hasInteracted.current || showResults) return
    headingRef.current?.focus({ preventScroll: true })
  }, [step, showResults])

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current)
    }
  }, [])

  const scrollToQuiz = () => {
    quizRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const clearTimer = () => {
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
  }

  const handleSelect = (optionId: string) => {
    if (!question || transitioning) return

    hasInteracted.current = true
    clearTimer()
    setAnswers((current) => ({ ...current, [question.id]: optionId }))
    setTransitioning(true)

    const isLast = step === total - 1
    advanceTimer.current = window.setTimeout(() => {
      setTransitioning(false)
      if (isLast) {
        setShowResults(true)
      } else {
        setStep((current) => Math.min(current + 1, total - 1))
      }
      scrollToQuiz()
    }, prefersReducedMotion() ? 0 : 240)
  }

  const handleBack = () => {
    clearTimer()
    setTransitioning(false)
    setShowResults(false)

    if (step > 0) {
      setStep((current) => Math.max(0, current - 1))
    }
    hasInteracted.current = true
    window.setTimeout(scrollToQuiz, 0)
  }

  const handleRestart = () => {
    clearTimer()
    setTransitioning(false)
    setAnswers({})
    setStep(0)
    setShowResults(false)
    setInvalidShare(false)
    hasInteracted.current = false
    window.history.replaceState(null, '', window.location.pathname)
    window.setTimeout(scrollToQuiz, 0)
  }

  const handleReview = () => {
    setShowResults(false)
    setStep(total - 1)
    hasInteracted.current = true
    window.setTimeout(scrollToQuiz, 0)
  }

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number, optionCount: number) => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return

    event.preventDefault()
    let nextIndex = index

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (index + 1) % optionCount
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + optionCount) % optionCount
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = optionCount - 1
    }

    optionRefs.current[nextIndex]?.focus()
  }

  const accent = ACCENTS[step % ACCENTS.length]
  const QuestionIcon = QUESTION_ICONS[step % QUESTION_ICONS.length]
  const selectedIndex = question
    ? question.options.findIndex((option) => option.id === selectedOption)
    : -1

  if (showResults && outcome) {
    return (
      <div ref={quizRef} id="quiz" className="scroll-mt-24">
        <QuizResult
          answers={answers}
          outcome={outcome}
          locale={locale}
          onRestart={handleRestart}
          onReview={handleReview}
        />
      </div>
    )
  }

  return (
    <div ref={quizRef} id="quiz" className="scroll-mt-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080a13]/90 shadow-[0_30px_100px_-50px_rgba(0,229,255,0.55)] backdrop-blur-xl">
        <div className={`pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full ${accent.glow} blur-3xl`} />
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.line}`} />

        <div className="relative p-5 sm:p-7 lg:p-9">
          {invalidShare && (
            <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100" role="status">
              {t('ui.invalidShare')}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              {t('ui.questionProgress', { current: step + 1, total })}
            </p>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {QUIZ_QUESTIONS.map((entry, index) => (
                <span
                  key={entry.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === step
                      ? `w-7 ${accent.dot}`
                      : index < step
                        ? 'w-3 bg-white/35'
                        : 'w-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label={t('ui.progressLabel')}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={step + 1}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r ${accent.line} transition-[width] duration-500 motion-reduce:transition-none`}
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>

          <div key={question.id} className="quiz-enter mt-7">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accent.icon}`}>
                <QuestionIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  {t(`questions.${question.id}.chapter`)}
                </p>
                <h2
                  ref={headingRef}
                  id={`quiz-question-${question.id}`}
                  tabIndex={-1}
                  className="mt-1.5 max-w-3xl text-2xl font-semibold leading-tight text-white outline-none sm:text-3xl"
                >
                  {t(`questions.${question.id}.prompt`)}
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-400">{t('ui.answerHint')}</p>

            <fieldset className="mt-5 min-w-0 border-0 p-0">
              <legend className="sr-only">{t('ui.questionLabel', { current: step + 1, total })}</legend>
              <div
                role="radiogroup"
                aria-labelledby={`quiz-question-${question.id}`}
                className="grid gap-3 md:grid-cols-2"
              >
                {question.options.map((option, index) => {
                  const isSelected = option.id === selectedOption
                  const tabIndex = selectedIndex === -1 ? (index === 0 ? 0 : -1) : selectedIndex === index ? 0 : -1

                  return (
                    <button
                      key={option.id}
                      ref={(element) => {
                        optionRefs.current[index] = element
                      }}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={tabIndex}
                      disabled={transitioning}
                      onClick={() => handleSelect(option.id)}
                      onKeyDown={(event) => handleOptionKeyDown(event, index, question.options.length)}
                      className={`group relative flex min-h-[92px] w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a13] disabled:cursor-wait ${
                        isSelected
                          ? 'border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_12px_40px_-18px_rgba(0,229,255,0.55)]'
                          : 'border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.055]'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black transition ${
                          isSelected
                            ? 'border-cyan-300/60 bg-cyan-300 text-zinc-950'
                            : 'border-white/10 bg-black/25 text-zinc-500 group-hover:text-zinc-300'
                        }`}
                        aria-hidden="true"
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={`flex-1 text-sm leading-6 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                        {t(`questions.${question.id}.options.${option.id}`)}
                      </span>
                      {isSelected && (
                        <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0 || transitioning}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-zinc-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {t('ui.back')}
              </button>
              <p className="text-xs text-zinc-600">
                {step === total - 1 ? t('ui.lastQuestionHint') : t('ui.answerHint')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
