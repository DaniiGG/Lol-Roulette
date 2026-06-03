import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAuth } from "@/lib/verify-jwt";

export async function GET() {
  const { data } = await supabaseAdmin.from("challenges").select("*");
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    switch (action) {

      case 'create': {
        const { champion_id, champion_name, lane, reroll_count } = body
        const { data, error } = await supabaseAdmin
          .from('challenges')
          .insert([{
            user_id: auth.userId,
            champion_id: String(champion_id),
            champion_name,
            lane,
            status: 'pending',
            xp_reward: 100,
            reroll_count: reroll_count ?? 0
          }])
          .select()
          .single()

        if (error) {
          console.error('❌ Error creating challenge:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ challenge: data })
      }

      case 'reroll': {
        const { challenge_id, champion_id, champion_name, lane, reroll_count } = body
        const { data, error } = await supabaseAdmin
          .from('challenges')
          .update({
            champion_id: String(champion_id),
            champion_name,
            lane,
            created_at: new Date().toISOString(),
            reroll_count
          })
          .eq('id', challenge_id)
          .eq('user_id', auth.userId)
          .select()
          .single()

        if (error) {
          console.error('❌ Error updating challenge:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ challenge: data })
      }

      case 'complete': {
        const { champion_name, match_id, match_data } = body
        let query = supabaseAdmin
          .from('challenges')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            match_id,
            match_data
          })
          .eq('user_id', auth.userId)
          .eq('status', 'pending')

        if (champion_name) {
          query = query.eq('champion_name', champion_name)
        }

        const { data, error } = await query

        if (error) {
          console.error('❌ Error completing challenge:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true })
      }

      case 'complete_by_id': {
        const { challenge_id, match_id, match_data } = body
        const { data, error } = await supabaseAdmin
          .from('challenges')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            match_id,
            match_data
          })
          .eq('id', challenge_id)
          .eq('user_id', auth.userId)
          .select()
          .single()

        if (error) {
          console.error('❌ Error completing challenge:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ challenge: data })
      }

      case 'fail': {
        const { challenge_id, match_id, match_data } = body
        const { data, error } = await supabaseAdmin
          .from('challenges')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            match_id,
            match_data
          })
          .eq('id', challenge_id)
          .eq('user_id', auth.userId)

        if (error) {
          console.error('❌ Error failing challenge:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ Challenges API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
