// app/api/auth/verify-session/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Buscar sesión
    const { data: session, error } = await supabase
      .from('sessions')
      .select('user_id, puuid, expires_at')
      .eq('token', token)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verificar expiración
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('sessions').delete().eq('token', token)
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Obtener usuario
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single()

    // Actualizar last_used
    await supabase
      .from('sessions')
      .update({ last_used: new Date().toISOString() })
      .eq('token', token)

    return NextResponse.json({ user })

  } catch (error: any) {
    console.error('Verify session error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


