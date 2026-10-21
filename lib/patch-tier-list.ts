export type TierRole = 'top' | 'jungle' | 'mid' | 'adc' | 'support'

export type TierGrade = 'S+' | 'S' | 'A' | 'B' | 'C'

export type ChampionDifficulty = 'low' | 'medium' | 'high'

export type ChampionPlaystyle =
  | 'frontline'
  | 'engage'
  | 'scaling'
  | 'poke'
  | 'assassin'
  | 'splitpush'
  | 'utility'
  | 'sustain'
  | 'zone'

export type ChampionPatchType = 'buff' | 'nerf' | 'adjustment' | 'none'

export type ChampionStatSample = {
  winRateBefore?: number
  winRateAfter?: number
  winRateDelta?: number
  pickRateDelta?: number
  note: string
}

export type TierChampion = {
  id: string
  name: string
  role: TierRole
  tier: TierGrade
  difficulty: ChampionDifficulty
  playstyles: ChampionPlaystyle[]
  category: 'core' | 'watch'
  rising?: boolean
  why: string
  changes: string
  strengths: string[]
  weaknesses: string[]
  profile: string
  stats?: ChampionStatSample
}

export type FinderRank = 'low' | 'mid' | 'high' | 'elite'

export type PatchTierListSource = {
  label: string
  url: string
}

export type PatchTierListData = {
  patch: string
  lastReviewed: string
  ui: Record<string, string>
  roles: Record<TierRole, string>
  roleDescriptions: Record<TierRole, string>
  tiers: Record<TierGrade, string>
  tierDescriptions: Record<TierGrade, string>
  difficulties: Record<ChampionDifficulty, string>
  playstyles: Record<ChampionPlaystyle, string>
  ranks: Record<FinderRank, string>
  patchTypes: Record<ChampionPatchType, string>
  championPoolNote: string
  champions: TierChampion[]
  sources: PatchTierListSource[]
}

export const PATCH_TYPE_BY_CHAMPION: Record<string, ChampionPatchType> = {
  Azir: 'buff',
  Caitlyn: 'adjustment',
  Darius: 'buff',
  Garen: 'none',
  Gwen: 'none',
  Jinx: 'nerf',
  KogMaw: 'none',
  Leona: 'none',
  LeeSin: 'nerf',
  MissFortune: 'buff',
  MonkeyKing: 'nerf',
  Nidalee: 'nerf',
  Nunu: 'buff',
  Orianna: 'buff',
  Qiyana: 'nerf',
  Rammus: 'nerf',
  Ryze: 'buff',
  Shyvana: 'none',
  Sion: 'buff',
  Taliyah: 'buff',
  Taric: 'adjustment',
  Tristana: 'nerf',
  Varus: 'adjustment',
  Velkoz: 'buff',
  Viktor: 'nerf',
  Volibear: 'none',
  XinZhao: 'buff',
  Yone: 'nerf',
  Zyra: 'buff',
  Fizz: 'none',
}

export const TIER_ORDER: TierGrade[] = ['S+', 'S', 'A', 'B', 'C']
export const ROLE_ORDER: TierRole[] = ['top', 'jungle', 'mid', 'adc', 'support']
export const DIFFICULTY_ORDER: ChampionDifficulty[] = ['low', 'medium', 'high']
export const PLAYSTYLE_ORDER: ChampionPlaystyle[] = [
  'frontline',
  'engage',
  'scaling',
  'poke',
  'assassin',
  'splitpush',
  'utility',
  'sustain',
  'zone',
]
