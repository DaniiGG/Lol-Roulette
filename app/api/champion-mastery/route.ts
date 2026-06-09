import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/verify-jwt'

const RIOT_API_KEY = process.env.RIOT_API_KEY!

function getPlatformRegion(region: string): string {
  return region.toLowerCase()
}

export async function POST(request: Request) {
  try {
    console.log('🔍 Champion Mastery API called')
    
    if (!RIOT_API_KEY) {
      console.error('❌ RIOT_API_KEY not set')
      return NextResponse.json(
        { error: 'Server configuration error: Riot API key missing' },
        { status: 500 }
      )
    }

    const auth = verifyAuth(request)
    console.log('🔐 Auth result:', auth ? { userId: auth.userId, puuid: auth.puuid?.substring(0, 10) + '...' } : 'null')
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { puuid, region } = await request.json()
    console.log('📥 Request body:', { puuid: puuid?.substring(0, 10) + '...', region })

    if (!puuid || !region) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (puuid !== auth.puuid) {
      return NextResponse.json({ error: 'Cannot fetch mastery for another user' }, { status: 403 })
    }

    const platformRegion = getPlatformRegion(region)
    console.log('🌍 Platform region:', platformRegion)

    const url = `https://${platformRegion}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}`
    console.log('🌐 Fetching:', url)

    const masteryRes = await fetch(url, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
      next: { revalidate: 300 }
    })

    console.log('📡 Riot API response:', masteryRes.status, masteryRes.statusText)

    if (!masteryRes.ok) {
      const errorText = await masteryRes.text()
      console.error('❌ Riot API error:', masteryRes.status, errorText)
      
      // Return detailed error to client for debugging
      return NextResponse.json(
        { error: `Riot API error: ${masteryRes.status}`, details: errorText },
        { status: masteryRes.status }
      )
    }

    const masteryData = await masteryRes.json()
    console.log('✅ Mastery data received:', masteryData?.length, 'champions')

    return NextResponse.json({ masteries: masteryData })
  } catch (error) {
    console.error('💥 Champion mastery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch champion mastery', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}