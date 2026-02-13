// app/api/auth/riot-oauth/authorize/route.ts
import { NextResponse } from 'next/server'

const RIOT_CLIENT_ID = process.env.RIOT_CLIENT_ID!
const RIOT_REDIRECT_URI = process.env.RIOT_REDIRECT_URI!

export async function GET() {
  // Construir URL de autorización de Riot
  const authUrl = new URL('https://auth.riotgames.com/authorize')
  
  authUrl.searchParams.append('redirect_uri', RIOT_REDIRECT_URI)
  authUrl.searchParams.append('client_id', RIOT_CLIENT_ID)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', 'openid')

  // Opcional: state para CSRF protection
  // const state = generateRandomState()
  // authUrl.searchParams.append('state', state)

  // Redirigir al usuario a Riot Games para autorización
  return NextResponse.redirect(authUrl.toString())
}