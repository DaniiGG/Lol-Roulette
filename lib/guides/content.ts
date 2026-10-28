import { GUIDE_SLUGS } from './meta'
import type { ChampionGuideContent, ChampionGuideContentFile } from './types'

export function asGuideContentFile(raw: unknown): ChampionGuideContentFile | null {
  if (!raw || typeof raw !== 'object') return null
  const candidate = raw as ChampionGuideContentFile
  if (!candidate.champions || typeof candidate.champions !== 'object') return null
  if (typeof candidate.patch !== 'string' || typeof candidate.updatedAt !== 'string') return null
  return candidate
}

export function getGuideContent(raw: unknown, slug: string): ChampionGuideContent | undefined {
  const file = asGuideContentFile(raw)
  return file?.champions?.[slug]
}

export function getGuideDirectory(raw: unknown): ChampionGuideContent[] {
  const file = asGuideContentFile(raw)
  if (!file) return []
  return GUIDE_SLUGS.map((slug) => file.champions[slug]).filter(Boolean)
}

export function getAllGuideContent(raw: unknown): ChampionGuideContent[] {
  const file = asGuideContentFile(raw)
  if (!file) return []
  return Object.values(file.champions)
}

export function guideWordCount(guide: ChampionGuideContent): number {
  const chunks: string[] = [
    guide.tagline,
    guide.heroIntro.join(' '),
    guide.quickAnswer,
    ...Object.values(guide.quickStart),
  ]

  for (const ability of guide.abilities) {
    chunks.push(ability.description, ...ability.tips, ability.mistake ?? '')
  }

  if (guide.skillOrder) chunks.push(...guide.skillOrder.explanation, guide.skillOrder.note)

  if (guide.runes) {
    chunks.push(
      guide.runes.summary,
      ...guide.runes.primaryRunes.map((rune) => rune.why ?? ''),
      ...guide.runes.secondaryRunes.map((rune) => rune.why ?? ''),
      ...guide.runes.notes
    )
  }

  chunks.push(...(guide.summonerSpells ?? []).map((spell) => spell.why))

  for (const build of guide.builds ?? []) {
    chunks.push(build.summary)
    for (const group of [build.starting, build.core, build.situational, build.boots]) {
      if (!group) continue
      chunks.push(group.note ?? '', ...group.items.map((item) => item.why))
    }
    chunks.push(...build.notes)
  }

  for (const combo of guide.combos) {
    chunks.push(combo.situation, combo.execution, combo.mistake, combo.warning ?? '')
  }

  for (const section of guide.sections) {
    chunks.push(section.heading, ...section.paragraphs, ...(section.bullets ?? []))
    for (const sub of section.subsections ?? []) {
      chunks.push(sub.heading, ...(sub.paragraphs ?? []), ...(sub.bullets ?? []))
    }
  }

  chunks.push(...(guide.matchups?.difficult ?? []).map((m) => m.advice))
  chunks.push(...(guide.matchups?.favorable ?? []).map((m) => m.advice))
  chunks.push(...guide.mistakes)

  for (const drill of guide.practicePlan) {
    chunks.push(drill.title, ...drill.steps)
  }

  for (const item of guide.faq) {
    chunks.push(item.q, item.a)
  }

  return chunks.join(' ').split(/\s+/).filter(Boolean).length
}

export function guideReadingTime(guide: ChampionGuideContent): number {
  return Math.max(1, Math.round(guideWordCount(guide) / 200))
}
