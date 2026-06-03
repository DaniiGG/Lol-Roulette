// app/api/admin/cleanup-challenges/route.ts
// Endpoint para limpiar challenges antiguos manualmente

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    // Optional: Add auth check here
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    let totalDeleted = 0

    // 1. Delete completed challenges older than 7 days
    const { count: completedCount, error: error1 } = await supabaseAdmin
      .from('challenges')
      .delete({ count: 'exact' })
      .eq('status', 'completed')
      .lt('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (error1) {
      console.error('Error deleting completed challenges:', error1)
    } else {
      totalDeleted += completedCount || 0
      console.log(`✅ Deleted ${completedCount} completed challenges older than 7 days`)
    }

    // 2. Delete pending challenges older than 24 hours (abandoned)
    const { count: pendingCount, error: error2 } = await supabaseAdmin
      .from('challenges')
      .delete({ count: 'exact' })
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error2) {
      console.error('Error deleting pending challenges:', error2)
    } else {
      totalDeleted += pendingCount || 0
      console.log(`✅ Deleted ${pendingCount} pending challenges older than 24 hours`)
    }

    // 3. Delete failed challenges older than 3 days
    const { count: failedCount, error: error3 } = await supabaseAdmin
      .from('challenges')
      .delete({ count: 'exact' })
      .eq('status', 'failed')
      .lt('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())

    if (error3) {
      console.error('Error deleting failed challenges:', error3)
    } else {
      totalDeleted += failedCount || 0
      console.log(`✅ Deleted ${failedCount} failed challenges older than 3 days`)
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      deleted: {
        completed: completedCount || 0,
        pending: pendingCount || 0,
        failed: failedCount || 0,
        total: totalDeleted
      }
    })

  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    )
  }
}

// También permitir GET para fácil testing
export async function GET() {
  return POST(new Request('http://localhost'))
}