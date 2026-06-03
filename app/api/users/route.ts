import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuth } from '@/lib/verify-jwt'

export async function POST(request: Request) {
  const auth = verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    switch (action) {

      case 'update_stats': {
        const { xp, level, current_streak, longest_streak, total_challenges_completed } = body
        const { data, error } = await supabaseAdmin
          .from('users')
          .update({
            ...(xp !== undefined && { xp }),
            ...(level !== undefined && { level }),
            ...(current_streak !== undefined && { current_streak }),
            ...(longest_streak !== undefined && { longest_streak }),
            ...(total_challenges_completed !== undefined && { total_challenges_completed })
          })
          .eq('id', auth.userId)
          .select()
          .single()

        if (error) {
          console.error('❌ Error updating user stats:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ user: data })
      }

      case 'reset_streak': {
        const { data, error } = await supabaseAdmin
          .from('users')
          .update({ current_streak: 0 })
          .eq('id', auth.userId)
          .select()
          .single()

        if (error) {
          console.error('❌ Error resetting streak:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ user: data })
      }

      case 'add_xp': {
        const { xp } = body
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('xp')
          .eq('id', auth.userId)
          .single()

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const { data, error } = await supabaseAdmin
          .from('users')
          .update({ xp: user.xp + xp })
          .eq('id', auth.userId)
          .select()
          .single()

        if (error) {
          console.error('❌ Error adding XP:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ user: data })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ Users API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
