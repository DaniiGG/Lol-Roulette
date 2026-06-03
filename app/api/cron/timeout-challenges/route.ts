// app/api/cron/timeout-challenges/route.ts
// Marca challenges pendientes > 1.5 horas como failed y resetea rachas

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  // Proteger endpoint
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('⏰ [CRON] Checking for timed-out challenges...')

    // 1. Buscar challenges pendientes de hace más de 1.5 horas
    const timeoutThreshold = new Date(Date.now() - 90 * 60 * 1000).toISOString() // 90 minutos
    
    const { data: timedOutChallenges, error: fetchError } = await supabaseAdmin
      .from('challenges')
      .select('id, user_id, champion_name, created_at')
      .eq('status', 'pending')
      .lt('created_at', timeoutThreshold)

    if (fetchError) {
      console.error('❌ Error fetching timed-out challenges:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!timedOutChallenges || timedOutChallenges.length === 0) {
      console.log('✅ No timed-out challenges found')
      return NextResponse.json({ 
        message: 'No timed-out challenges',
        processed: 0 
      })
    }

    console.log(`📊 Found ${timedOutChallenges.length} timed-out challenges`)

    let processed = 0
    const affectedUsers = new Set<string>()

    // 2. Marcar cada challenge como failed
    for (const challenge of timedOutChallenges) {
      try {
        // Marcar challenge como failed
        const { error: updateError } = await supabaseAdmin
          .from('challenges')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', challenge.id)

        if (updateError) {
          console.error(`❌ Error updating challenge ${challenge.id}:`, updateError)
          continue
        }

        console.log(`❌ Challenge timed out: ${challenge.champion_name} (created ${new Date(challenge.created_at).toLocaleString()})`)
        
        affectedUsers.add(challenge.user_id)
        processed++

      } catch (err) {
        console.error(`❌ Error processing challenge ${challenge.id}:`, err)
      }
    }

    // 3. Resetear racha de todos los usuarios afectados
    let streaksReset = 0
    
    for (const userId of affectedUsers) {
      try {
        const { error: streakError } = await supabaseAdmin
          .from('users')
          .update({ current_streak: 0 })
          .eq('id', userId)

        if (streakError) {
          console.error(`❌ Error resetting streak for user ${userId}:`, streakError)
        } else {
          streaksReset++
          console.log(`💔 Streak reset for user ${userId}`)
        }
      } catch (err) {
        console.error(`❌ Error resetting streak for user ${userId}:`, err)
      }
    }

    console.log(`✅ [CRON] Timeout processing complete:`)
    console.log(`  - Challenges marked as failed: ${processed}`)
    console.log(`  - Streaks reset: ${streaksReset}`)

    return NextResponse.json({
      success: true,
      message: 'Timeout processing completed',
      stats: {
        challengesFailed: processed,
        streaksReset: streaksReset,
        affectedUsers: affectedUsers.size
      }
    })

  } catch (error: any) {
    console.error('❌ [CRON] Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// También soportar POST
export async function POST(request: Request) {
  return GET(request)
}
