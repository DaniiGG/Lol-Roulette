import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Crosshair,
  Languages,
  Shield,
  Sparkles,
  Swords,
  Target,
  Zap,
} from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import TableOfContents from '@/components/blog/TableOfContents'
import { formatDate } from '@/lib/blog/content'
import {
  GUIDE_LOCALES,
  GUIDE_PATCH,
  getGuideHref,
  getGuideIndexHref,
  guideAbilityIconUrl,
  guideChampionIconUrl,
  guideItemIconUrl,
  guideLoadingUrl,
  guideRuneIconUrl,
  guideSummonerIconUrl,
} from '@/lib/guides/meta'
import { guideReadingTime } from '@/lib/guides/content'
import type {
  ChampionGuideContent,
  GuideAbilityCard,
  GuideBuild,
  GuideChampionMeta,
  GuideItemGroup,
  GuideRune,
  GuideRuneSetup,
  GuideSection,
} from '@/lib/guides/types'

type GuideTranslator = (key: string, values?: Record<string, string | number | Date>) => string

type GuideArticleProps = {
  content: ChampionGuideContent
  meta: GuideChampionMeta
  locale: string
  related: GuideChampionMeta[]
}

const ABILITY_STYLES: Record<string, string> = {
  Q: 'border-[#C89B3C]/40 bg-[#C89B3C]/15 text-[#E8C77E]',
  W: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  E: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  R: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  P: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
}

function Section({
  id,
  title,
  children,
  className = '',
}: {
  id: string
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <h2 className="mb-6 border-b border-neutral-800 pb-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-neutral-300 leading-7">
          <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-[#C89B3C]" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function StatCard({ stat, t }: { stat: GuideChampionMeta['stats'][number]; t: GuideTranslator }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{stat.source}</span>
        {stat.tier ? (
          <span className="rounded-full border border-[#C89B3C]/30 bg-[#C89B3C]/10 px-2 py-0.5 text-xs font-bold text-[#C89B3C]">
            {stat.tier}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] leading-5 text-neutral-500">{stat.context}</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-neutral-900 p-2">
          <dt className="text-[10px] uppercase tracking-wide text-neutral-500">{t('guide.winRate')}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-emerald-300">{stat.winRate}</dd>
        </div>
        <div className="rounded-xl bg-neutral-900 p-2">
          <dt className="text-[10px] uppercase tracking-wide text-neutral-500">{t('guide.pickRate')}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-white">{stat.pickRate ?? '—'}</dd>
        </div>
        <div className="rounded-xl bg-neutral-900 p-2">
          <dt className="text-[10px] uppercase tracking-wide text-neutral-500">{t('guide.banRate')}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-white">{stat.banRate ?? '—'}</dd>
        </div>
      </dl>
      {stat.rank ? (
        <p className="mt-3 text-right text-[11px] text-neutral-500">
          {t('guide.rank')}: {stat.rank}
        </p>
      ) : null}
    </div>
  )
}

function AbilityCard({ ability, t }: { ability: GuideAbilityCard; t: GuideTranslator }) {
  return (
    <article className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 transition hover:border-neutral-700">
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950">
          <Image
            src={guideAbilityIconUrl(ability.key, ability.icon)}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${ABILITY_STYLES[ability.key] ?? ABILITY_STYLES.Q}`}>
              {ability.key}
            </span>
            <h3 className="text-lg font-semibold text-white">{ability.name}</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-300">{ability.description}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-neutral-950/60 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('guide.abilityTips')}</p>
        <ul className="space-y-2">
          {ability.tips.map((tip) => (
            <li key={tip} className="flex gap-2 text-sm leading-6 text-neutral-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C89B3C]" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {ability.mistake ? (
        <p className="mt-3 flex gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 text-sm leading-6 text-rose-200/90">
          <AlertTriangle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-semibold">{t('guide.commonMistake')}: </span>
            {ability.mistake}
          </span>
        </p>
      ) : null}
    </article>
  )
}

function RuneChip({ rune }: { rune: GuideRune }) {
  return (
    <li className="flex gap-3 rounded-xl border border-neutral-800 bg-neutral-950/50 p-3">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-neutral-700 bg-neutral-900">
        <Image src={guideRuneIconUrl(rune.icon)} alt="" fill sizes="36px" className="object-cover" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{rune.name}</p>
        {rune.why ? <p className="mt-0.5 text-xs leading-5 text-neutral-400">{rune.why}</p> : null}
      </div>
    </li>
  )
}

function RuneSetup({ setup, t }: { setup: GuideRuneSetup; t: GuideTranslator }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">{setup.title}</h3>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="rounded-full border border-neutral-700 bg-neutral-950/60 px-3 py-1">{setup.primaryTree.name}</span>
            <span className="text-neutral-600">+</span>
            <span className="rounded-full border border-neutral-700 bg-neutral-950/60 px-3 py-1">{setup.secondaryTree.name}</span>
          </div>
        </div>
        <p className="mt-3 text-sm leading-7 text-neutral-300">{setup.summary}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-neutral-700 bg-neutral-950">
              <Image src={guideRuneIconUrl(setup.primaryTree.icon)} alt="" fill sizes="40px" className="object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">{t('guide.primaryTree')}</p>
              <h4 className="font-semibold text-white">{setup.primaryTree.name}</h4>
            </div>
          </div>
          <div className="mb-3 rounded-2xl border border-[#C89B3C]/25 bg-[#C89B3C]/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C89B3C]">{t('guide.keystone')}</p>
            <div className="mt-2 flex gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#C89B3C]/40 bg-neutral-950">
                <Image src={guideRuneIconUrl(setup.keystone.icon)} alt="" fill sizes="44px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{setup.keystone.name}</p>
                {setup.keystone.why ? <p className="mt-0.5 text-xs leading-5 text-neutral-400">{setup.keystone.why}</p> : null}
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {setup.primaryRunes.map((rune) => (
              <RuneChip key={rune.id} rune={rune} />
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-neutral-700 bg-neutral-950">
              <Image src={guideRuneIconUrl(setup.secondaryTree.icon)} alt="" fill sizes="40px" className="object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">{t('guide.secondaryTree')}</p>
              <h4 className="font-semibold text-white">{setup.secondaryTree.name}</h4>
            </div>
          </div>
          <ul className="space-y-2">
            {setup.secondaryRunes.map((rune) => (
              <RuneChip key={rune.id} rune={rune} />
            ))}
          </ul>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('guide.alternatives')}</p>
            <div className="flex flex-wrap gap-2">
              {setup.alternatives.map((alternative) => (
                <span key={alternative} className="rounded-full border border-neutral-700 bg-neutral-950/60 px-2.5 py-1 text-[11px] text-neutral-300">
                  {alternative}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-4">
        <ul className="space-y-2">
          {setup.notes.map((note) => (
            <li key={note} className="flex gap-2 text-sm leading-6 text-neutral-400">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-600" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ItemGroup({ group, icon }: { group: GuideItemGroup; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h4 className="text-sm font-semibold text-white">{group.label}</h4>
      </div>
      <ul className="space-y-2.5">
        {group.items.map((item) => (
          <li key={`${group.label}-${item.id}-${item.name}`} className="flex gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
              <Image src={guideItemIconUrl(item.icon)} alt="" fill sizes="36px" className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{item.name}</p>
              <p className="mt-0.5 text-[11px] leading-5 text-neutral-400">{item.why}</p>
            </div>
          </li>
        ))}
      </ul>
      {group.note ? <p className="mt-3 text-[11px] leading-5 text-neutral-500">{group.note}</p> : null}
    </div>
  )
}

function BuildCard({ build, t }: { build: GuideBuild; t: GuideTranslator }) {
  return (
    <article className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">{build.label}</h3>
          <p className="mt-1 text-sm leading-6 text-neutral-300">{build.summary}</p>
        </div>
        {build.badge ? (
          <span className="rounded-full border border-[#C89B3C]/30 bg-[#C89B3C]/10 px-3 py-1 text-[11px] font-semibold text-[#C89B3C]">
            {build.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <ItemGroup group={build.starting} icon={<Sparkles className="h-4 w-4 text-[#C89B3C]" />} />
        <ItemGroup group={build.core} icon={<Target className="h-4 w-4 text-emerald-300" />} />
        {build.boots ? <ItemGroup group={build.boots} icon={<Zap className="h-4 w-4 text-cyan-300" />} /> : null}
        <ItemGroup group={build.situational} icon={<Shield className="h-4 w-4 text-violet-300" />} />
      </div>

      <ul className="mt-4 space-y-2">
        {build.notes.map((note) => (
          <li key={note} className="flex gap-2 text-sm leading-6 text-neutral-400">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-600" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
      <span className="sr-only">{t('guide.builds')}</span>
    </article>
  )
}

function ContentSection({ section }: { section: GuideSection }) {
  return (
    <div className="space-y-4">
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-base leading-8 text-neutral-300">
          {paragraph}
        </p>
      ))}
      {section.bullets?.length ? <BulletList items={section.bullets} /> : null}
      {section.subsections?.length ? (
        <div className="space-y-6">
          {section.subsections.map((subsection) => (
            <div key={subsection.heading}>
              <h3 className="mb-2 text-xl font-semibold text-white">{subsection.heading}</h3>
              {subsection.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-base leading-8 text-neutral-300">
                  {paragraph}
                </p>
              ))}
              {subsection.bullets?.length ? <BulletList items={subsection.bullets} /> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default async function GuideArticle({ content, meta, locale, related }: GuideArticleProps) {
  const t = await getTranslations('guide-ui')
  const tBlog = await getTranslations('blog')
  const readingTime = guideReadingTime(content)
  const indexHref = getGuideIndexHref(locale)
  const sources = content.sources?.length ? content.sources : meta.sources
  const primaryStat = meta.stats[0]

  const tocItems = [
    { id: 'abilities', text: t('guide.abilities'), level: 2 as const },
    ...(content.skillOrder ? [{ id: 'skill-order', text: t('guide.skillOrder'), level: 2 as const }] : []),
    ...(content.runes ? [{ id: 'runes', text: t('guide.runes'), level: 2 as const }] : []),
    ...(content.summonerSpells?.length ? [{ id: 'summoner-spells', text: t('guide.summonerSpells'), level: 2 as const }] : []),
    ...(content.builds?.length ? [{ id: 'builds', text: t('guide.builds'), level: 2 as const }] : []),
    { id: 'combos', text: t('guide.combos'), level: 2 as const },
    ...content.sections.map((section) => ({ id: section.id, text: section.heading, level: 2 as const })),
    ...(content.matchups ? [{ id: 'matchups', text: t('guide.matchups'), level: 2 as const }] : []),
    { id: 'mistakes', text: t('guide.mistakes'), level: 2 as const },
    { id: 'practice-plan', text: t('guide.practicePlan'), level: 2 as const },
    { id: 'faq', text: t('guide.faq'), level: 2 as const },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-4 pb-12 pt-8 md:px-6 md:pt-10">
      <article className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'League Roulette', href: '/' },
            { label: tBlog('blog'), href: '/blog' },
            { label: t('guide.breadcrumb'), href: '/blog/guides' },
            { label: content.name },
          ]}
        />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Languages className="h-4 w-4 text-[#C89B3C]" aria-hidden="true" />
            <span>{t('guide.language')}:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GUIDE_LOCALES.map((guideLocale) => (
              <Link
                key={guideLocale}
                href={getGuideHref(content.slug, guideLocale)}
                hrefLang={guideLocale}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  guideLocale === locale
                    ? 'bg-[#C89B3C] text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {guideLocale.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        <header className="grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-[#C89B3C]/30 bg-[#C89B3C]/10 px-3 py-1 font-semibold uppercase tracking-wide text-[#C89B3C]">
                {content.roleLabel}
              </span>
              <span className="rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1 text-neutral-300">
                {t('guide.patchLabel', { patch: GUIDE_PATCH })}
              </span>
              <span className="rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1 text-neutral-300">
                {t('guide.difficulty')}: {content.difficultyLabel}
              </span>
            </div>

            <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-neutral-500">{content.title}</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">{content.h1}</h1>
            <p className="mt-4 max-w-2xl text-xl leading-8 text-neutral-300">{content.tagline}</p>

            <div className="mt-5 space-y-3 text-base leading-7 text-neutral-400">
              {content.heroIntro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#C89B3C]" />
                {t('guide.readTime', { n: readingTime })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#C89B3C]" />
                {t('guide.updatedLabel', { date: formatDate(meta.updatedAt, locale) })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-[#C89B3C]" />
                {primaryStat ? `${primaryStat.winRate} WR` : content.difficultyLabel}
              </span>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-800 shadow-2xl shadow-neutral-950/60">
            <Image
              src={meta.splash}
              alt={`${content.name} splash art`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/5 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-300/80">{content.name}</p>
                <p className="text-lg font-semibold text-white">{content.roleLabel}</p>
              </div>
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/15 shadow-lg">
                <Image
                  src={guideChampionIconUrl(`${meta.championId}.png`)}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <section className="mt-10 rounded-3xl border border-[#C89B3C]/25 bg-gradient-to-br from-[#C89B3C]/10 via-neutral-900/40 to-neutral-950/20 p-6 md:p-8">
          <div className="mb-3 flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-[#C89B3C]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C89B3C]">{t('guide.quickAnswer')}</h2>
          </div>
          <p className="max-w-4xl text-lg leading-8 text-neutral-200">{content.quickAnswer}</p>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t('guide.role')}</p>
            <p className="mt-1 font-semibold text-white">{content.quickStart.role}</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t('guide.playstyle')}</p>
            <p className="mt-1 font-semibold text-white">{content.quickStart.playstyle}</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t('guide.keyMechanic')}</p>
            <p className="mt-1 font-semibold text-white">{content.quickStart.keyMechanic}</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t('guide.winCondition')}</p>
            <p className="mt-1 font-semibold text-white">{content.quickStart.winCondition}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-300">{t('guide.beginnerMistake')}</p>
          <p className="mt-1 text-sm leading-6 text-rose-100/80">{content.quickStart.beginnerMistake}</p>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <Section id="abilities" title={t('guide.abilities')}>
              <div className="grid gap-4 xl:grid-cols-2">
                {content.abilities.map((ability) => (
                  <AbilityCard key={ability.key} ability={ability} t={t} />
                ))}
              </div>
            </Section>

            {content.skillOrder ? <Section id="skill-order" title={t('guide.skillOrder')}>
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-full border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 text-xs text-neutral-300">
                    {t('guide.priority')}: <span className="font-semibold text-white">{content.skillOrder.priority}</span>
                  </div>
                  <div className="rounded-full border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 text-xs text-neutral-300">
                    {t('guide.start')}: <span className="font-semibold text-white">{content.skillOrder.start}</span>
                  </div>
                </div>

                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('guide.levels')}</p>
                <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
                  {content.skillOrder.levels.map((step) => (
                    <div
                      key={step.level}
                      className={`rounded-xl border p-1.5 text-center ${ABILITY_STYLES[step.ability] ?? ABILITY_STYLES.Q}`}
                    >
                      <span className="block text-[9px] font-medium opacity-60">{step.level}</span>
                      <span className="block text-sm font-bold">{step.ability}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {content.skillOrder.explanation.map((explanation) => (
                    <p key={explanation} className="flex gap-2 text-sm leading-6 text-neutral-300">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#C89B3C]" />
                      <span>{explanation}</span>
                    </p>
                  ))}
                </div>
                <p className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm leading-6 text-neutral-400">
                  {content.skillOrder.note}
                </p>
              </div>
            </Section> : null}

            {content.runes ? (
              <Section id="runes" title={t('guide.runes')}>
                <RuneSetup setup={content.runes} t={t} />
              </Section>
            ) : null}

            {content.summonerSpells?.length ? <Section id="summoner-spells" title={t('guide.summonerSpells')}>
              <div className="grid gap-4 md:grid-cols-2">
                {content.summonerSpells.map((spell) => (
                  <div key={spell.name} className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950">
                        <Image src={guideSummonerIconUrl(spell.icon)} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                      <h3 className="font-semibold text-white">{spell.name}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-300">{spell.why}</p>
                    {spell.alternative ? (
                      <p className="mt-3 text-xs leading-5 text-neutral-500">{spell.alternative}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section> : null}

            {content.builds?.length ? <Section id="builds" title={t('guide.builds')}>
              <div className="space-y-5">
                {content.builds.map((build) => (
                  <BuildCard key={build.id} build={build} t={t} />
                ))}
              </div>
            </Section> : null}

            <Section id="combos" title={t('guide.combos')}>
              <div className="grid gap-4 xl:grid-cols-2">
                {content.combos.map((combo) => (
                  <article key={combo.name} className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
                    <h3 className="text-lg font-semibold text-white">{combo.name}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {combo.sequence.map((step, index) => (
                        <span key={`${combo.name}-${step.key}-${index}`} className="contents">
                          <span className="rounded-lg border border-neutral-700 bg-neutral-950/80 px-2.5 py-1 text-xs font-bold text-[#E8C77E]">
                            {step.label}
                          </span>
                          {index < combo.sequence.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-neutral-600" /> : null}
                        </span>
                      ))}
                    </div>
                    <dl className="mt-4 space-y-2 text-sm leading-6">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{t('guide.situation')}</dt>
                        <dd className="text-neutral-300">{combo.situation}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{t('guide.execution')}</dt>
                        <dd className="text-neutral-300">{combo.execution}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 flex gap-2 text-xs leading-5 text-rose-200/80">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{combo.mistake}</span>
                    </p>
                    {combo.warning ? (
                      <p className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs leading-5 text-amber-200/80">
                        {t('guide.warning')}: {combo.warning}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </Section>

            {content.sections.map((section) => (
              <Section key={section.id} id={section.id} title={section.heading}>
                <ContentSection section={section} />
              </Section>
            ))}

            {content.matchups ? <Section id="matchups" title={t('guide.matchups')}>
              <p className="mb-5 text-sm leading-7 text-neutral-400">{content.matchups.note}</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-rose-300">
                    <Swords className="h-4 w-4" />
                    {t('guide.difficultMatchups')}
                  </h3>
                  <div className="space-y-3">
                    {content.matchups.difficult.map((matchup) => (
                      <article key={matchup.name} className="rounded-2xl border border-rose-500/15 bg-rose-500/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950">
                            <Image src={guideChampionIconUrl(matchup.icon)} alt="" fill sizes="44px" className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white">{matchup.name}</p>
                            <p className="text-xs text-rose-200/80">
                              {matchup.winRate ? `${matchup.winRate} WR` : ''}
                              {matchup.games ? ` · ${t('guide.games', { games: matchup.games })}` : ''}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-neutral-300">{matchup.advice}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    <Shield className="h-4 w-4" />
                    {t('guide.favorableMatchups')}
                  </h3>
                  <div className="space-y-3">
                    {content.matchups.favorable.map((matchup) => (
                      <article key={matchup.name} className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950">
                            <Image src={guideChampionIconUrl(matchup.icon)} alt="" fill sizes="44px" className="object-cover" />
                          </div>
                          <p className="font-semibold text-white">{matchup.name}</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-neutral-300">{matchup.advice}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </Section> : null}

            <Section id="mistakes" title={t('guide.mistakes')}>
              <div className="grid gap-3 md:grid-cols-2">
                {content.mistakes.map((mistake) => (
                  <div key={mistake} className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                    <p className="text-sm leading-6 text-neutral-300">{mistake}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="practice-plan" title={t('guide.practicePlan')}>
              <div className="grid gap-4 md:grid-cols-3">
                {content.practicePlan.map((drill, index) => (
                  <article key={drill.title} className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C89B3C]/15 text-sm font-bold text-[#C89B3C]">
                      {index + 1}
                    </span>
                    <h3 className="mt-3 font-semibold text-white">{drill.title}</h3>
                    <ol className="mt-3 space-y-2">
                      {drill.steps.map((step) => (
                        <li key={step} className="flex gap-2 text-sm leading-6 text-neutral-400">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-600" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </article>
                ))}
              </div>
            </Section>

            <Section id="faq" title={t('guide.faq')}>
              <div className="space-y-3">
                {content.faq.map((item) => (
                  <details key={item.q} className="group rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
                    <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold text-white">
                      <span className="text-[#C89B3C]">Q:</span>
                      <span>{item.q}</span>
                      <ArrowRight className="ml-auto h-4 w-4 shrink-0 rotate-90 text-neutral-500 transition group-open:-rotate-90" />
                    </summary>
                    <p className="mt-3 pl-7 text-sm leading-7 text-neutral-300">{item.a}</p>
                  </details>
                ))}
              </div>
            </Section>

            <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#C89B3C]" />
                <h2 className="text-lg font-semibold text-white">{t('guide.aboutStats')}</h2>
              </div>
              <p className="text-sm leading-7 text-neutral-400">{content.statsNote}</p>
            </section>

            {sources.length ? (
              <section aria-labelledby="guide-sources">
                <h2 id="guide-sources" className="mb-3 text-lg font-semibold text-white">
                  {t('guide.sources')}
                </h2>
                <ul className="space-y-2 text-sm text-neutral-400">
                  {sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C89B3C] transition hover:underline"
                      >
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {meta.stats.length ? (
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('guide.patchLabel', { patch: GUIDE_PATCH })}</p>
                  <div className="space-y-3">
                    {meta.stats.map((stat) => (
                      <StatCard key={stat.source} stat={stat} t={t} />
                    ))}
                  </div>
                </div>
              ) : null}
              <TableOfContents items={tocItems} />
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="mb-5 text-2xl font-semibold text-white">{t('guide.related')}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {related.map((relatedGuide) => (
                <Link
                  key={relatedGuide.slug}
                  href={getGuideHref(relatedGuide.slug, locale)}
                  className="group relative flex min-h-40 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900"
                >
                  <Image
                    src={guideLoadingUrl(relatedGuide.championId)}
                    alt={`${relatedGuide.championId} loading screen`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-neutral-950/10" />
                  <div className="relative flex w-full items-end justify-between gap-4 p-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-400">{t(`roles.${relatedGuide.primaryRole}`)}</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{relatedGuide.championId === 'KSante' ? "K'Sante" : relatedGuide.championId}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C89B3C] px-3 py-1.5 text-xs font-semibold text-neutral-950">
                      {t('guide.readRelated')}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-14 rounded-3xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 to-transparent p-8">
          <h2 className="mb-3 text-2xl font-semibold text-white">{t('guide.ctaTitle')}</h2>
          <p className="mb-6 max-w-3xl text-base leading-7 text-neutral-300">{t('guide.ctaDescription')}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={locale === 'en' ? '/' : `/${locale}`}
              className="rounded-xl bg-[#C89B3C] px-6 py-3 font-semibold text-neutral-950 transition hover:bg-[#d9aa44]"
            >
              {t('guide.ctaButton')}
            </Link>
            <Link
              href={indexHref}
              className="rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-3 font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-800"
            >
              {t('guide.browseGuides')}
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}
