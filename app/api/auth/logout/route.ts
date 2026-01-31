// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (token) {
      await supabase.from('sessions').delete().eq('token', token)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}