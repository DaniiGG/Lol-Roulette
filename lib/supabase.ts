// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para TypeScript
export type User = {
  id: string
  username: string
  summoner_name?: string
  region?: string
  profile_icon_id?: number
  summoner_level?: number
  xp: number
  level: number
  current_streak: number
  longest_streak: number
  total_challenges_completed: number
  created_at: string
  last_login: string
  puuid?: string
  game_name?: string
  tag_line?: string
}

export type Challenge = {
  id: string
  user_id: string
  champion_id: string
  champion_name: string
  lane: string
  status: 'pending' | 'completed' | 'failed'
  xp_reward: number
  match_id?: string
  created_at: string
  completed_at?: string
  reroll_count?: number
  match_data?: any
}

export type Achievement = {
  id: string
  user_id: string
  achievement_type: string
  achievement_name: string
  achievement_description?: string
  unlocked_at: string
}

export type ChallengeSession = {
  id: string
  user_id: string
  challenge_type: 'low_mastery' | 'region' | 'class'
  challenge_config: Record<string, any>
  duration_hours: number
  xp_multiplier: number
  started_at: string
  expires_at: string
  completed_at?: string
  status: 'active' | 'completed' | 'expired' | 'failed'
  valid_wins: number
  bonus_xp: number
  total_base_xp: number
  processed_matches: string[]
  created_at: string
  updated_at: string
}

export type ChallengeSessionWithDefinition = ChallengeSession & {
  definition?: {
    id: string
    name: string
    description: string
    category: string
    emoji: string
  }
}