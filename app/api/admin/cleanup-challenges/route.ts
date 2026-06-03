import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function isAuthorized(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) return false

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${adminSecret}`
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let totalDeleted = 0

    const { count: completedCount, error: completedError } = await supabaseAdmin
      .from('challenges')
      .delete({ count: 'exact' })
      .eq('status', 'completed')
      .lt('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (completedError) {
      console.error('Error deleting completed challenges:', completedError)
    } else {
      totalDeleted += completedCount || 0
    }

    const { count: pendingCount, error: pendingError } = await supabaseAdmin
      .from('challenges')
      .delete({ count: 'exact' })
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (pendingError) {
      console.error('Error deleting pending challenges:', pendingError)
    } else {
      totalDeleted += pendingCount || 0
    }

    const { count: failedCount, error: failedError } = await supabaseAdmin
      .from('challenges')
      .delete({ count: 'exact' })
      .eq('status', 'failed')
      .lt('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())

    if (failedError) {
      console.error('Error deleting failed challenges:', failedError)
    } else {
      totalDeleted += failedCount || 0
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
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

export async function GET(request: Request) {
  return POST(request)
}
