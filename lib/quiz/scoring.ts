import type {
  Answers,
  ChampionProfile,
  QuizOption,
  QuizOutcome,
  QuizQuestion,
  ScoredChampion,
  TraitId,
  TraitScores,
} from './types'

const TRAIT_ORDER: TraitId[] = [
  'aggression',
  'mechanics',
  'patience',
  'creativity',
  'teamwork',
  'carry',
  'dueling',
  'ranged',
  'control',
  'scaling',
  'mobility',
  'protection',
]

function emptyTraitScores(): TraitScores {
  return {
    aggression: 0,
    mechanics: 0,
    patience: 0,
    creativity: 0,
    teamwork: 0,
    carry: 0,
    dueling: 0,
    ranged: 0,
    control: 0,
    scaling: 0,
    mobility: 0,
    protection: 0,
  }
}

function getSelectedOption(question: QuizQuestion, answers: Answers): QuizOption | null {
  const answerId = answers[question.id]
  if (!answerId) return null
  return question.options.find((option) => option.id === answerId) ?? null
}

export function calculateTraitScores(answers: Answers, questions: QuizQuestion[]): TraitScores {
  const scores = emptyTraitScores()

  for (const question of questions) {
    const option = getSelectedOption(question, answers)
    if (!option) continue

    for (const [trait, value] of Object.entries(option.traits)) {
      if (value) scores[trait as TraitId] += value
    }
  }

  return scores
}

export function topTraitIds(scores: TraitScores, count = 3): TraitId[] {
  return [...TRAIT_ORDER]
    .filter((trait) => scores[trait] > 0)
    .sort((a, b) => {
      const difference = scores[b] - scores[a]
      if (difference !== 0) return difference
      return TRAIT_ORDER.indexOf(a) - TRAIT_ORDER.indexOf(b)
    })
    .slice(0, count)
}

function cosineSimilarity(a: TraitScores, b: TraitScores): number {
  let dot = 0
  let normA = 0
  let normB = 0

  for (const trait of TRAIT_ORDER) {
    dot += a[trait] * b[trait]
    normA += a[trait] * a[trait]
    normB += b[trait] * b[trait]
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function championSimilarity(scores: TraitScores, champion: ChampionProfile): number {
  return cosineSimilarity(scores, champion.traits)
}

function toScoredChampion(scores: TraitScores, champion: ChampionProfile): ScoredChampion {
  const similarity = championSimilarity(scores, champion)
  return {
    champion,
    similarity,
    matchPercent: Math.round(Math.min(98, Math.max(55, 55 + similarity * 43))),
  }
}

function pickAlternate(main: ScoredChampion, ranked: ScoredChampion[]): ScoredChampion {
  const minimum = Math.max(0.42, main.similarity * 0.7)
  const differentClass = ranked
    .slice(1)
    .filter((entry) => entry.champion.championClass !== main.champion.championClass)

  return (
    differentClass.find((entry) => entry.similarity >= minimum) ??
    differentClass[0] ??
    ranked[1] ??
    main
  )
}

function pickWildcard(main: ScoredChampion, alternate: ScoredChampion, ranked: ScoredChampion[]): ScoredChampion {
  const excluded = new Set([main.champion.id, alternate.champion.id])
  const pool = ranked.filter((entry) => !excluded.has(entry.champion.id))
  if (pool.length === 0) return alternate

  const minimumSimilarity = Math.max(0.4, main.similarity * 0.62)
  const plausible = pool.filter((entry) => entry.similarity >= minimumSimilarity)
  const candidates = plausible.length > 0 ? plausible : pool.slice(0, 1)

  let best = candidates[0]
  let bestScore = Number.NEGATIVE_INFINITY

  for (const entry of candidates) {
    const mainSimilarity = championSimilarity(main.champion.traits, entry.champion)
    const diversity = 1 - mainSimilarity
    const classBonus = entry.champion.championClass !== main.champion.championClass ? 0.04 : 0
    const wildcardScore = entry.similarity + diversity * 0.18 + classBonus

    if (
      wildcardScore > bestScore ||
      (wildcardScore === bestScore && entry.similarity > best.similarity) ||
      (wildcardScore === bestScore && entry.similarity === best.similarity && entry.champion.id < best.champion.id)
    ) {
      best = entry
      bestScore = wildcardScore
    }
  }

  return best
}

export function isCompleteAnswers(answers: Answers, questions: QuizQuestion[]): boolean {
  return questions.every((question) => {
    const option = getSelectedOption(question, answers)
    return option !== null
  })
}

export function scoreAnswers(
  answers: Answers,
  questions: QuizQuestion[],
  champions: ChampionProfile[]
): QuizOutcome | null {
  if (!isCompleteAnswers(answers, questions) || champions.length === 0) return null

  const scores = calculateTraitScores(answers, questions)
  const topTraits = topTraitIds(scores, 3)
  const ranked = champions
    .map((champion) => toScoredChampion(scores, champion))
    .sort((a, b) => {
      const difference = b.similarity - a.similarity
      if (Math.abs(difference) > 1e-12) return difference
      return a.champion.id.localeCompare(b.champion.id)
    })

  const main = ranked[0]
  const alternate = pickAlternate(main, ranked)
  const wildcard = pickWildcard(main, alternate, ranked)

  return {
    traits: scores,
    topTraits,
    main,
    alternate,
    wildcard,
    ranked,
  }
}
