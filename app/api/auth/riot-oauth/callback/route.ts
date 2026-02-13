// app/api/auth/riot-oauth/callback/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const RIOT_CLIENT_ID = process.env.RIOT_CLIENT_ID!
const RIOT_CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET!
const RIOT_REDIRECT_URI = process.env.RIOT_REDIRECT_URI!
const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      )
    }

    console.log('🔑 Exchanging authorization code for tokens...')

    // 1️⃣ Intercambiar código por tokens
    const tokenResponse = await fetch('https://auth.riotgames.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${RIOT_CLIENT_ID}:${RIOT_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: RIOT_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token exchange failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
        { status: 400 }
      )
    }

    const tokens = await tokenResponse.json()
    const { access_token, id_token } = tokens

    console.log('✅ Tokens received')

    // 2️⃣ Decodificar id_token para obtener PUUID y Riot ID
    const idTokenDecoded = jwt.decode(id_token) as any

    if (!idTokenDecoded || !idTokenDecoded.sub) {
      return NextResponse.json(
        { error: 'Invalid id_token' },
        { status: 400 }
      )
    }

    const puuid = idTokenDecoded.sub
    const riotId = idTokenDecoded.preferred_username || '' // GameName#TAG

    const gameName = idTokenDecoded.preferred_username?.split('#')[0] || puuid
const tagLine = idTokenDecoded.preferred_username?.split('#')[1] || '0000'

    console.log('👤 User PUUID:', puuid)
    console.log('👤 Riot ID:', riotId)

    // Extraer GameName y TagLine

    if (!gameName || !tagLine) {
      return NextResponse.json(
        { error: 'Invalid Riot ID format' },
        { status: 400 }
      )
    }

    // 3️⃣ Obtener región del usuario (desde el token o asumir)
    // Por ahora asumimos EUW, pero podrías pedirlo en un paso adicional
    const region = 'euw1' // TODO: Obtener región del usuario

    // 4️⃣ Obtener información adicional del summoner (opcional pero recomendado)
    let summonerData = null
    try {
      const summonerResponse = await fetch(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        {
          headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY!
          }
        }
      )

      if (summonerResponse.ok) {
        summonerData = await summonerResponse.json()
        console.log('✅ Summoner data retrieved')
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch summoner data:', err)
    }

    // 5️⃣ Crear o actualizar usuario en la base de datos
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('puuid', puuid)
      .single()

    let user

    if (existingUser) {
      // Actualizar usuario existente
      const { data: updatedUser } = await supabase
        .from('users')
        .update({
          game_name: gameName,
          tag_line: tagLine,
          summoner_name: summonerData?.name || existingUser.summoner_name,
          summoner_level: summonerData?.summonerLevel || existingUser.summoner_level,
          profile_icon_id: summonerData?.profileIconId || existingUser.profile_icon_id,
          region: region,
          last_login: new Date().toISOString()
        })
        .eq('puuid', puuid)
        .select()
        .single()

      user = updatedUser
      console.log('✅ Updated existing user:', gameName)
    } else {
      // Crear nuevo usuario
      const { data: newUser } = await supabase
        .from('users')
        .insert([{
          puuid: puuid,
          game_name: gameName,
          tag_line: tagLine,
          summoner_id: summonerData?.id || null,
          summoner_name: summonerData?.name || gameName,
          summoner_level: summonerData?.summonerLevel || 1,
          profile_icon_id: summonerData?.profileIconId || 0,
          region: region,
          xp: 0,
          level: 1,
          current_streak: 0,
          longest_streak: 0,
          total_challenges_completed: 0
        }])
        .select()
        .single()

      user = newUser
      console.log('✅ Created new user:', gameName)
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create/update user' },
        { status: 500 }
      )
    }

    // 6️⃣ Crear sesión JWT
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        puuid: user.puuid,
        gameName: user.game_name,
        tagLine: user.tag_line
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    // 7️⃣ Guardar sesión en la base de datos
    await supabase.from('sessions').insert([{
      user_id: user.id,
      token: sessionToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    }])

    console.log('✅ Session created for:', gameName)

    return NextResponse.json({
      token: sessionToken,
      user: {
        id: user.id,
        puuid: user.puuid,
        game_name: user.game_name,
        tag_line: user.tag_line,
        summoner_name: user.summoner_name,
        summoner_level: user.summoner_level,
        profile_icon_id: user.profile_icon_id,
        region: user.region,
        xp: user.xp,
        level: user.level,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
        total_challenges_completed: user.total_challenges_completed
      }
    })

  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}