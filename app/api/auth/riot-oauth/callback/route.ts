import { NextResponse } from 'next/server'
import { supabaseAdmin  } from '@/lib/supabase-admin'
import jwt from 'jsonwebtoken'

console.log("SERVICE ROLE EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const RIOT_CLIENT_ID = process.env.RIOT_CLIENT_ID!
const RIOT_CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET!
const RIOT_REDIRECT_URI = process.env.RIOT_REDIRECT_URI!
const JWT_SECRET = process.env.JWT_SECRET!

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
      console.error(text)
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 400 })
    }

    const { access_token } = await tokenResponse.json()

    // 2️⃣ Get Riot account info (CORRECT WAY)
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
      console.error(text)
      return NextResponse.json({ error: 'Failed to fetch Riot account' }, { status: 400 })
    }

    const account = await accountResponse.json()

    const puuid = account.puuid
    const gameName = account.gameName
    const tagLine = account.tagLine
    const region = account.region

    console.log('✅ Riot ID:', `${gameName}#${tagLine}`)

    // 3️⃣ Create or update user
    const { data: existingUser, error: fetchError } = await supabaseAdmin 
      .from('users')
      .select('*')
      .eq('puuid', puuid)
      .maybeSingle()

if (fetchError) {
  console.error("FETCH ERROR:", fetchError)
  throw new Error("User lookup failed")
}

    let user

    if (existingUser) {
      const { data } = await supabaseAdmin 
        .from('users')
        .update({
          game_name: gameName,
          tag_line: tagLine,
          last_login: new Date().toISOString()
        })
        .eq('puuid', puuid)
        .select()
        .single()

      user = data
    } else {
  const { data, error: insertError } = await supabaseAdmin
    .from('users')
    .insert([{
      puuid,
      game_name: gameName,
      tag_line: tagLine,
      region: 'euw1', // ⚠️ IMPORTANTE si tu tabla tiene region NOT NULL
      xp: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
      total_challenges_completed: 0
    }])
    .select()
    .maybeSingle()

  if (insertError) {
    console.error("INSERT ERROR:", insertError)
    throw new Error("User insert failed")
  }

  user = data
}

    // 4️⃣ Create session
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        puuid,
        gameName,
        tagLine
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    await supabaseAdmin .from('sessions').insert([{
      user_id: user.id,
      token: sessionToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }])

    return NextResponse.json({
      token: sessionToken,
      user
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
