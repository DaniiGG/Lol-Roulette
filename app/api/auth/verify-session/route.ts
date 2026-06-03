// app/api/auth/verify-session/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verificar si es un JWT (nuevo sistema RSO) o token legacy
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any
      console.log('✅ JWT verified:', decoded.gameName)
    } catch (jwtError) {
      // Si falla JWT, intentar con sistema legacy (tabla sessions)
      console.log('⚠️ Not a valid JWT, trying legacy session...')
      
      const { data: session, error } = await supabaseAdmin
        .from('sessions')
        .select('user_id, puuid, expires_at')
        .eq('token', token)
        .single()

      if (error || !session) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      // Verificar expiración
      if (new Date(session.expires_at) < new Date()) {
        await supabaseAdmin.from('sessions').delete().eq('token', token)
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }

      // Obtener usuario
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user_id)
        .single()

      // Actualizar last_used
      await supabaseAdmin
        .from('sessions')
        .update({ last_used: new Date().toISOString() })
        .eq('token', token)

      return NextResponse.json({ user })
    }

    // Si llegamos aquí, el JWT es válido
    // Obtener usuario por ID del JWT
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Actualizar sesión en DB (opcional, para tracking)
    await supabaseAdmin
      .from('sessions')
      .update({ last_used: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('token', token)

    return NextResponse.json({ user })

  } catch (error: any) {
    console.error('❌ Verify session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}