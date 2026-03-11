// app/api/auth/create-session/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📥 Received create-session request:', {
      puuid: body.puuid,
      gameName: body.gameName,
      tagLine: body.tagLine,
      region: body.region
    })

    const {
      puuid,
      gameName,
      tagLine,
      summonerId,
      summonerName,
      summonerLevel,
      profileIconId,
      region
    } = body

    // Validar datos requeridos
    if (!puuid || !gameName || !tagLine || !region) {
      console.error('❌ Missing required fields:', {
        hasPuuid: !!puuid,
        hasGameName: !!gameName,
        hasTagLine: !!tagLine,
        hasRegion: !!region
      })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('✅ Creating session for:', `${gameName}#${tagLine}`)

    // Verificar si el usuario ya existe
    console.log('🔍 Checking if user exists...')
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('puuid', puuid)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: fetchError.message 
      }, { status: 500 })
    }

    let user

    if (existingUser) {
      // Usuario existe - actualizar datos
      console.log('📝 User exists, updating...', existingUser.id)
      
      const updateData = {
        game_name: gameName,
        tag_line: tagLine,
        region: region,
        summoner_level: summonerLevel || existingUser.summoner_level,
        profile_icon_id: profileIconId || existingUser.profile_icon_id,
        last_login: new Date().toISOString()
      }
      
      console.log('📊 Update data:', updateData)

      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('puuid', puuid)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Error updating user:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update user', 
          details: updateError.message 
        }, { status: 500 })
      }

      user = updatedUser
      console.log('✅ User updated successfully')
    } else {
      // Usuario nuevo - crear
      console.log('✨ Creating new user')
      
      const insertData = {
        puuid,
        game_name: gameName,
        tag_line: tagLine,
        region,
        profile_icon_id: profileIconId || 0,
        summoner_level: summonerLevel || 1,
        xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        total_challenges_completed: 0
      }
      
      console.log('📊 Insert data:', insertData)

      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([insertData])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating user:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        })
        return NextResponse.json({ 
          error: 'Failed to create user', 
          details: insertError.message,
          hint: insertError.hint
        }, { status: 500 })
      }

      user = newUser
      console.log('✅ User created successfully:', user.id)
    }

    // Verificar que JWT_SECRET existe
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined!')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Crear token JWT
    console.log('🔐 Creating JWT token...')
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        puuid,
        gameName,
        tagLine,
        region
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    console.log('✅ JWT token created')

    // Guardar sesión en DB
    console.log('💾 Saving session to database...')
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert([{
        user_id: user.id,
        token: sessionToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }])

    if (sessionError) {
      console.error('❌ Error creating session:', {
        message: sessionError.message,
        details: sessionError.details,
        hint: sessionError.hint,
        code: sessionError.code
      })
      return NextResponse.json({ 
        error: 'Failed to create session', 
        details: sessionError.message,
        hint: sessionError.hint
      }, { status: 500 })
    }

    console.log('✅ Session created successfully for user:', user.id)

    return NextResponse.json({
      token: sessionToken,
      user
    })

  } catch (error: any) {
    console.error('❌ Create session error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}