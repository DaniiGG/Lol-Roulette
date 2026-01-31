// app/api/auth/create-session/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      puuid, gameName, tagLine, summonerId, summonerName, 
      summonerLevel, profileIconId, region 
    } = body

    if (!puuid) {
      return NextResponse.json({ error: 'Missing PUUID' }, { status: 400 })
    }

    // 1. Buscar o crear usuario
    let { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('puuid', puuid)
      .single()

    let user

    if (existingUser) {
      // Actualizar datos
      const { data: updatedUser } = await supabase
        .from('users')
        .update({
          game_name: gameName,
          tag_line: tagLine,
          summoner_name: summonerName,
          summoner_id: summonerId,
          summoner_level: summonerLevel,
          profile_icon_id: profileIconId,
          region: region,
          last_login: new Date().toISOString()
        })
        .eq('puuid', puuid)
        .select()
        .single()

      user = updatedUser
    } else {
      // Crear nuevo usuario
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          puuid,
          game_name: gameName,
          tag_line: tagLine,
          summoner_name: summonerName,
          summoner_id: summonerId,
          summoner_level: summonerLevel,
          profile_icon_id: profileIconId,
          region: region,
          xp: 0,
          level: 1,
          current_streak: 0,
          longest_streak: 0,
          total_challenges_completed: 0
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      user = newUser
    }

    // 2. Crear token de sesión
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 días

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        user_id: user.id,
        puuid: puuid,
        token: token,
        expires_at: expiresAt.toISOString()
      }])

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({
      token,
      user
    })

  } catch (error: any) {
    console.error('Create session error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
