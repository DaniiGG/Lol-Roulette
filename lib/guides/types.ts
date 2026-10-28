export type GuideRole = 'top' | 'jungle' | 'mid' | 'adc' | 'support'

export type GuideDifficulty = 'low' | 'medium' | 'high' | 'very-high'

export type GuideAbilityKey = 'P' | 'Q' | 'W' | 'E' | 'R'

export type GuideAbilityCard = {
  key: GuideAbilityKey
  name: string
  icon: string
  description: string
  tips: string[]
  mistake?: string
}

export type GuideLevelStep = {
  level: number
  ability: 'Q' | 'W' | 'E' | 'R'
}

export type GuideSkillOrder = {
  priority: string
  start: string
  levels: GuideLevelStep[]
  explanation: string[]
  note: string
}

export type GuideRune = {
  id: number
  name: string
  icon: string
  why?: string
}

export type GuideRuneTree = {
  name: string
  icon: string
}

export type GuideRuneSetup = {
  title: string
  summary: string
  primaryTree: GuideRuneTree
  secondaryTree: GuideRuneTree
  keystone: GuideRune
  primaryRunes: GuideRune[]
  secondaryRunes: GuideRune[]
  alternatives: string[]
  notes: string[]
}

export type GuideSummonerSpell = {
  name: string
  icon: string
  why: string
  alternative?: string
}

export type GuideItem = {
  id: string
  name: string
  icon: string
  why: string
}

export type GuideItemGroup = {
  label: string
  items: GuideItem[]
  note?: string
}

export type GuideBuild = {
  id: string
  label: string
  badge?: string
  summary: string
  starting: GuideItemGroup
  core: GuideItemGroup
  situational: GuideItemGroup
  boots?: GuideItemGroup
  notes: string[]
}

export type GuideComboStep = {
  key: string
  label: string
}

export type GuideCombo = {
  name: string
  sequence: GuideComboStep[]
  situation: string
  execution: string
  mistake: string
  warning?: string
}

export type GuideSubsection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export type GuideSection = {
  id: string
  heading: string
  paragraphs: string[]
  bullets?: string[]
  subsections?: GuideSubsection[]
}

export type GuideMatchup = {
  name: string
  icon: string
  winRate?: string
  games?: string
  advice: string
}

export type GuideMatchupGroup = {
  difficult: GuideMatchup[]
  favorable: GuideMatchup[]
  note: string
}

export type GuideFaqItem = {
  q: string
  a: string
}

export type GuideSource = {
  label: string
  url: string
}

export type GuideStat = {
  source: string
  context: string
  winRate: string
  pickRate?: string
  banRate?: string
  matches?: string
  tier?: string
  rank?: string
  url: string
}

export type GuideQuickStart = {
  role: string
  secondaryRoles: string
  difficulty: string
  playstyle: string
  keyMechanic: string
  beginnerMistake: string
  winCondition: string
}

export type ChampionGuideContent = {
  slug: string
  name: string
  title: string
  role: GuideRole
  roleLabel: string
  difficulty: GuideDifficulty
  difficultyLabel: string
  tagline: string
  metaTitle: string
  metaDescription: string
  h1: string
  heroIntro: string[]
  quickAnswer: string
  quickStart: GuideQuickStart
  abilities: GuideAbilityCard[]
  skillOrder?: GuideSkillOrder
  runes?: GuideRuneSetup
  summonerSpells?: GuideSummonerSpell[]
  builds?: GuideBuild[]
  combos: GuideCombo[]
  sections: GuideSection[]
  matchups?: GuideMatchupGroup
  mistakes: string[]
  practicePlan: { title: string; steps: string[] }[]
  faq: GuideFaqItem[]
  sources?: GuideSource[]
  statsNote: string
  lastUpdated: string
}

export type ChampionGuideContentFile = {
  patch: string
  updatedAt: string
  champions: Record<string, ChampionGuideContent>
}

export type GuideChampionMeta = {
  slug: string
  championId: string
  roles: GuideRole[]
  primaryRole: GuideRole
  ddragonDifficulty: number
  localizedSlugs: Record<'en' | 'es', string>
  publishedAt: string
  updatedAt: string
  related: string[]
  splash: string
  loading: string
  stats: GuideStat[]
  sources: GuideSource[]
}
