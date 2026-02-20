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
}

export type Achievement = {
  id: string
  user_id: string
  achievement_type: string
  achievement_name: string
  achievement_description?: string
  unlocked_at: string
}