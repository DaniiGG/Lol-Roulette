// app/api/cron/expire-challenge-sessions/route.ts
// Expires active challenge sessions that have passed their expires_at timestamp

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
    console.log('⏰ [CRON] Checking for expired challenge sessions...')

    // Call the database function to expire sessions
    const { data: expiredCount, error } = await supabaseAdmin
      .rpc('expire_challenge_sessions')

    if (error) {
      console.error('❌ Error expiring challenge sessions:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log(`✅ [CRON] Expired ${expiredCount} challenge sessions`)

    return NextResponse.json({
      success: true,
      message: 'Challenge session expiration completed',
      expiredCount
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