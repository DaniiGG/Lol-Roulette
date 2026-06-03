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
      case 'reset_streak': {
        const { data, error } = await supabaseAdmin
          .from('users')
          .update({ current_streak: 0 })
          .eq('id', auth.userId)
          .select()
          .single()

        if (error) {
          console.error('Error resetting streak:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ user: data })
      }

      case 'update_stats':
      case 'add_xp':
        return NextResponse.json(
          { error: 'Stats are updated only by verified challenge completion' },
          { status: 403 }
        )

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Users API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
