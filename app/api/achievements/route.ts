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

      case 'unlock': {
        const { achievement_type, achievement_name, achievement_description } = body
        const { data, error } = await supabaseAdmin
          .from('achievements')
          .insert([{
            user_id: auth.userId,
            achievement_type,
            achievement_name,
            achievement_description
          }])
          .select()
          .single()

        if (error) {
          console.error('❌ Error unlocking achievement:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ achievement: data })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ Achievements API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
