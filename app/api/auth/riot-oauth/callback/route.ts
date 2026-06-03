import { NextResponse } from 'next/server'
import { supabaseAdmin  } from '@/lib/supabase-admin'
import jwt from 'jsonwebtoken'

const RIOT_CLIENT_ID = process.env.RIOT_CLIENT_ID!
const RIOT_CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET!
const RIOT_REDIRECT_URI = process.env.RIOT_REDIRECT_URI!
const JWT_SECRET = process.env.JWT_SECRET!
const RIOT_API_KEY = process.env.RIOT_API_KEY!

// Lista de todas las regiones de League of Legends
const ALL_REGIONS = [
  'br1',   // Brazil
  'eun1',  // Europe Nordic & East
  'euw1',  // Europe West
  'jp1',   // Japan
  'kr',    // Korea
  'la1',   // Latin America North
  'la2',   // Latin America South
  'na1',   // North America
  'oc1',   // Oceania
  'ph2',   // Philippines
  'ru',    // Russia
  'sg2',   // Singapore
  'th2',   // Thailand
  'tr1',   // Turkey
  'tw2',   // Taiwan
  'vn2'    // Vietnam
]

// Función para detectar la región del usuario
async function detectUserRegion(puuid: string): Promise<string> {
  console.log('🔍 Detecting region for PUUID:', puuid)

  // Intentar cada región hasta encontrar al summoner
  for (const region of ALL_REGIONS) {
    try {
      console.log(`  Trying region: ${region}...`)
      
      const response = await fetch(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY
          }
        }
      )

      if (response.ok) {
        console.log(`✅ Found user in region: ${region}`)
        return region
      }

      // Si es 404, probar siguiente región
      if (response.status === 404) {
        continue
      }

      // Si es rate limit o error del servidor, esperar un poco
      if (response.status === 429 || response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, 100))
        continue
      }

    } catch (error) {
      console.error(`  Error checking region ${region}:`, error)
      continue
    }
  }

  // Si no se encontró en ninguna región, usar EUW por defecto
  console.warn('⚠️ No region found, defaulting to euw1')
  return 'euw1'
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'No authorization code' }, { status: 400 })
    }

    // 1️⃣ Exchange code for tokens
    const tokenResponse = await fetch('https://auth.riotgames.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${RIOT_CLIENT_ID}:${RIOT_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: RIOT_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text()
      console.error('❌ Token exchange failed:', text)
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 400 })
    }

    const { access_token } = await tokenResponse.json()

    // 2️⃣ Get Riot account info
    const accountResponse = await fetch(
      'https://europe.api.riotgames.com/riot/account/v1/accounts/me',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )

    if (!accountResponse.ok) {
      const text = await accountResponse.text()
      console.error('❌ Account fetch failed:', text)
      return NextResponse.json({ error: 'Failed to fetch Riot account' }, { status: 400 })
    }

    const account = await accountResponse.json()

    const puuid = account.puuid
    const gameName = account.gameName
    const tagLine = account.tagLine

    console.log('✅ Riot ID:', `${gameName}#${tagLine}`)

    // 2.5️⃣ Detectar región automáticamente
    const region = await detectUserRegion(puuid)
    console.log('🌍 User region:', region)

    // 3️⃣ Get Summoner info (level + profile icon)
    const summonerResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    )

    if (!summonerResponse.ok) {
      const text = await summonerResponse.text()
      console.error('❌ Summoner fetch failed:', text)
      return NextResponse.json({ error: 'Failed to fetch summoner info' }, { status: 400 })
    }

    const summonerData = await summonerResponse.json()

    const summonerLevel = summonerData.summonerLevel
    const profileIconId = summonerData.profileIconId

    // 4️⃣ Create or update user
    const { data: existingUser, error: fetchError } = await supabaseAdmin 
      .from('users')
      .select('*')
      .eq('puuid', puuid)
      .maybeSingle()

    if (fetchError) {
      console.error("❌ User lookup failed:", fetchError)
      throw new Error("User lookup failed")
    }

    let user

    if (existingUser) {
      // Actualizar usuario existente (incluyendo región por si cambió)
      const { data } = await supabaseAdmin 
        .from('users')
        .update({
          game_name: gameName,
          tag_line: tagLine,
          region: region,  // ✅ Actualizar región
          summoner_level: summonerLevel,
          profile_icon_id: profileIconId,
          last_login: new Date().toISOString()
        })
        .eq('puuid', puuid)
        .select()
        .single()

      user = data
      console.log('✅ User updated:', user.id)
    } else {
      // Crear nuevo usuario
      const { data, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{
          puuid,
          game_name: gameName,
          tag_line: tagLine,
          region: region,  // ✅ Usar región detectada
          profile_icon_id: profileIconId,
          summoner_level: summonerLevel,
          xp: 0,
          level: 1,
          current_streak: 0,
          longest_streak: 0,
          total_challenges_completed: 0
        }])
        .select()
        .single()

      if (insertError) {
        console.error("❌ User insert failed:", insertError)
        throw new Error("User insert failed")
      }

      user = data
      console.log('✅ New user created:', user.id)
    }

    // 5️⃣ Create session
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        puuid,
        gameName,
        tagLine,
        region  // ✅ Incluir región en el token
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    await supabaseAdmin.from('sessions').insert([{
      user_id: user.id,
      token: sessionToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }])

    console.log('✅ Session created for user:', user.id)

    return NextResponse.json({
      token: sessionToken,
      user
    })

  } catch (err: any) {
    console.error('❌ Callback error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}
