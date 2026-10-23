export const TRAIT_IDS = [
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
] as const

export type TraitId = (typeof TRAIT_IDS)[number]

export type TraitScores = Record<TraitId, number>

export type ChampionRole = 'top' | 'jungle' | 'mid' | 'adc' | 'support'

export type ChampionClass = 'Fighter' | 'Assassin' | 'Mage' | 'Marksman' | 'Tank' | 'Support'

export interface QuizOption {
  id: string
  traits: Partial<TraitScores>
}

export interface QuizQuestion {
  id: string
  options: QuizOption[]
}

export type Answers = Record<string, string>

export interface ChampionProfile {
  id: string
  name: string
  ddragonKey: string
  role: ChampionRole
  championClass: ChampionClass
  traits: TraitScores
}

export interface ScoredChampion {
  champion: ChampionProfile
  similarity: number
  matchPercent: number
}

export interface QuizOutcome {
  traits: TraitScores
  topTraits: TraitId[]
  main: ScoredChampion
  alternate: ScoredChampion
  wildcard: ScoredChampion
  ranked: ScoredChampion[]
}
