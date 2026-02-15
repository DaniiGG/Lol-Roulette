// app/api/auth/riot-oauth/authorize/route.ts
import { NextResponse } from 'next/server'

const RIOT_CLIENT_ID = process.env.RIOT_CLIENT_ID!
const RIOT_REDIRECT_URI = process.env.RIOT_REDIRECT_URI!

export async function GET() {
  const params = new URLSearchParams({
    client_id: RIOT_CLIENT_ID,
    redirect_uri: RIOT_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid offline_access'
  })

  return NextResponse.redirect(
    `https://auth.riotgames.com/authorize?${params.toString()}`
  )
}
