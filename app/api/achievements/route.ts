import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuth } from '@/lib/verify-jwt'
import { ACHIEVEMENTS, calculateLevel, checkAchievement } from '@/lib/achievements'

export async function POST(request: Request) {
  const auth = verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, achievement_type } = body

    if (action !== 'unlock') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const achievement = ACHIEVEMENTS[achievement_type as keyof typeof ACHIEVEMENTS]
    if (!achievement) {
      return NextResponse.json({ error: 'Unknown achievement' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', auth.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const canUnlock = checkAchievement(achievement.type, {
      currentStreak: Number(user.current_streak),
      totalChallenges: Number(user.total_challenges_completed),
      level: Number(user.level)
    })

    if (!canUnlock) {
      return NextResponse.json({ error: 'Achievement requirements not met' }, { status: 403 })
    }

    const { data: existing } = await supabaseAdmin
      .from('achievements')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('achievement_type', achievement.type)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Achievement already unlocked' }, { status: 409 })
    }

    const { data: unlockedAchievement, error: insertError } = await supabaseAdmin
      .from('achievements')
      .insert([{
        user_id: auth.userId,
        achievement_type: achievement.type,
        achievement_name: achievement.name,
        achievement_description: achievement.description
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Error unlocking achievement:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const nextXp = Number(user.xp) + achievement.xpReward
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        xp: nextXp,
        level: calculateLevel(nextXp)
      })
      .eq('id', auth.userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error applying achievement XP:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      achievement: unlockedAchievement,
      user: updatedUser
    })
  } catch (error: any) {
    console.error('Achievements API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
