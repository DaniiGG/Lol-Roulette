// app/api/verify/route.ts
import { NextResponse } from 'next/server'

const RIOT_API_KEY = process.env.RIOT_API_KEY!

type VerifyRequest = {
  puuid: string
  region: string
  championId: number
}

export async function POST(request: Request) {
  try {
    const { puuid, region, championId }: VerifyRequest = await request.json()

    if (!puuid || !region || !championId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Obtener últimas partidas usando PUUID directamente
    const platformRegion = getPlatformRegion(region)
    const matchesRes = await fetch(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        next: { revalidate: 0 }
      }
    )

    if (!matchesRes.ok) {
      throw new Error('Failed to fetch matches')
    }

    const matchIds = await matchesRes.json()

    if (matchIds.length === 0) {
      return NextResponse.json(
        { error: 'No recent matches found' },
        { status: 404 }
      )
    }

    // 2. Verificar la partida más reciente
    const latestMatchId = matchIds[0]
    const matchRes = await fetch(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${latestMatchId}`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        next: { revalidate: 0 }
      }
    )

    if (!matchRes.ok) {
      throw new Error('Failed to fetch match details')
    }

    const match = await matchRes.json()

    // 3. Encontrar datos del jugador en la partida
    const participant = match.info.participants.find(
      (p: any) => p.puuid === puuid
    )

    if (!participant) {
      return NextResponse.json(
        { error: 'Player not found in match' },
        { status: 404 }
      )
    }

    // 4. Verificar si jugó con el campeón correcto
    const playedCorrectChampion = participant.championId === championId
    const won = participant.win

    return NextResponse.json({
      success: playedCorrectChampion && won,
      playedCorrectChampion,
      won,
      championPlayed: participant.championName,
      matchId: latestMatchId,
      gameMode: match.info.gameMode,
      gameDuration: match.info.gameDuration,
      stats: {
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
        gold: participant.goldEarned
      }
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify match' },
      { status: 500 }
    )
  }
}

// Mapeo de regiones a plataformas
function getPlatformRegion(region: string): string {
  const mapping: Record<string, string> = {
    'br1': 'americas',
    'eun1': 'europe',
    'euw1': 'europe',
    'jp1': 'asia',
    'kr': 'asia',
    'la1': 'americas',
    'la2': 'americas',
    'na1': 'americas',
    'oc1': 'sea',
    'ph2': 'sea',
    'ru': 'europe',
    'sg2': 'sea',
    'th2': 'sea',
    'tr1': 'europe',
    'tw2': 'sea',
    'vn2': 'sea'
  }
  
  return mapping[region.toLowerCase()] || 'europe'
}
