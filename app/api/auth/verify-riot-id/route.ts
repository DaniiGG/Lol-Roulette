// app/api/auth/verify-riot-id/route.ts
import { NextResponse } from 'next/server'

const RIOT_API_KEY = process.env.RIOT_API_KEY!

// Mapeo de región a routing
function getRouting(region: string): 'americas' | 'europe' | 'asia' {
  const mapping: Record<string, 'americas' | 'europe' | 'asia'> = {
    'br1': 'americas',
    'la1': 'americas',
    'la2': 'americas',
    'na1': 'americas',
    'oc1': 'americas',
    'eun1': 'europe',
    'euw1': 'europe',
    'ru': 'europe',
    'tr1': 'europe',
    'jp1': 'asia',
    'kr': 'asia',
    'ph2': 'asia',
    'sg2': 'asia',
    'th2': 'asia',
    'tw2': 'asia',
    'vn2': 'asia'
  }
  
  return mapping[region.toLowerCase()] || 'europe'
}

export async function POST(request: Request) {
  try {
    const { gameName, tagLine, region } = await request.json()

    if (!gameName || !tagLine || !region) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const routing = getRouting(region)

    // 1. Obtener PUUID (ID único e inmutable)
    const accountRes = await fetch(
      `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        next: { revalidate: 3600 }
      }
    )

    if (!accountRes.ok) {
      if (accountRes.status === 404) {
        return NextResponse.json(
          { error: 'Riot ID not found. Check your GameName#TAG format.' },
          { status: 404 }
        )
      }
      if (accountRes.status === 403) {
        return NextResponse.json(
          { error: 'API key error. Please contact support.' },
          { status: 500 }
        )
      }
      throw new Error('Failed to fetch account')
    }

    const accountData = await accountRes.json()
    const puuid = accountData.puuid

    // 2. Obtener datos del summoner
    const summonerRes = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        next: { revalidate: 3600 }
      }
    )

    if (!summonerRes.ok) {
      if (summonerRes.status === 404) {
        return NextResponse.json(
          { error: 'No League of Legends account found for this Riot ID in this region.' },
          { status: 404 }
        )
      }
      throw new Error('Failed to fetch summoner')
    }

    const summonerData = await summonerRes.json()

    // 3. Retornar todos los datos
    return NextResponse.json({
      puuid: puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      summonerId: summonerData.id,
      summonerName: summonerData.name,
      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
      region: region
    })

  } catch (error) {
    console.error('Verify Riot ID error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}