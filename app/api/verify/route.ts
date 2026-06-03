// app/api/verify/route.ts
import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/verify-jwt'

const RIOT_API_KEY = process.env.RIOT_API_KEY!

type VerifyRequest = {
  puuid: string
  region: string
  championId: number
  challengeCreatedAt?: string
}

export async function POST(request: Request) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      puuid,
      region,
      championId,
      challengeCreatedAt
    }: VerifyRequest = await request.json()

    if (!region || !championId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (puuid && puuid !== auth.puuid) {
      return NextResponse.json({ error: 'Cannot verify another user' }, { status: 403 })
    }

    // 1️⃣ Obtener últimas partidas
    const platformRegion = getPlatformRegion(region)
    const matchesRes = await fetch(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${auth.puuid}/ids?start=0&count=5`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        next: { revalidate: 0 }
      }
    )

    if (!matchesRes.ok) {
      throw new Error('Failed to fetch matches')
    }

    const matchIds: string[] = await matchesRes.json()

    if (!matchIds.length) {
      return NextResponse.json(
        { error: 'No recent matches found' },
        { status: 404 }
      )
    }

    // 2️⃣ Buscar la primera partida posterior al challenge
    const challengeCreatedAtMs = challengeCreatedAt
      ? Date.parse(challengeCreatedAt)
      : null

    let relevantMatch: any = null
    let relevantMatchId: string | null = null

    for (const matchId of matchIds) {
      const matchRes = await fetch(
        `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY },
          next: { revalidate: 0 }
        }
      )

      if (!matchRes.ok) continue

      const match = await matchRes.json()
      const matchEndMs =
        match.info?.gameEndTimestamp ?? match.info?.gameCreation

      // Si hay un timestamp del challenge, solo considerar partidas DESPUÉS
      if (
        challengeCreatedAtMs &&
        typeof matchEndMs === 'number' &&
        matchEndMs <= challengeCreatedAtMs
      ) {
        continue
      }

      relevantMatch = match
      relevantMatchId = matchId
      break
    }

    // Aún no hay partida nueva
    if (!relevantMatch || !relevantMatchId) {
  return NextResponse.json(
    {
      success: false,
      error: 'No new matches found after challenge timestamp'
    },
    { status: 404 }
  )
}

    // 3️⃣ Buscar participante
    const participant = relevantMatch.info.participants.find(
      (p: any) => p.puuid === auth.puuid
    )

    if (!participant) {
      return NextResponse.json(
        { error: 'Player not found in match' },
        { status: 404 }
      )
    }

    // 4️⃣ Resultado
    console.log('🔍 Verification comparison:')
    console.log('  Expected championId:', championId, typeof championId)
    console.log('  Played championId:', participant.championId, typeof participant.championId)
    console.log('  Champion name:', participant.championName)
    
    // Asegurar que ambos sean números para la comparación
    const expectedChampId = Number(championId)
    const playedChampId = Number(participant.championId)
    
    const playedCorrectChampion = playedChampId === expectedChampId
    const won = participant.win
    
    console.log('  Match?', playedCorrectChampion, `(${playedChampId} === ${expectedChampId})`)

    return NextResponse.json({
      success: playedCorrectChampion && won,
      playedCorrectChampion,
      won,
      championPlayed: participant.championName,
      championIdExpected: expectedChampId,
      championIdPlayed: playedChampId,
      matchId: relevantMatchId,
      gameMode: relevantMatch.info.gameMode,
      gameDuration: relevantMatch.info.gameDuration,
      stats: {
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        cs:
          participant.totalMinionsKilled +
          participant.neutralMinionsKilled,
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

// 🌍 Mapeo de regiones a plataformas
function getPlatformRegion(region: string): string {
  const mapping: Record<string, string> = {
    br1: 'americas',
    eun1: 'europe',
    euw1: 'europe',
    jp1: 'asia',
    kr: 'asia',
    la1: 'americas',
    la2: 'americas',
    na1: 'americas',
    oc1: 'sea',
    ph2: 'sea',
    ru: 'europe',
    sg2: 'sea',
    th2: 'sea',
    tr1: 'europe',
    tw2: 'sea',
    vn2: 'sea'
  }

  return mapping[region.toLowerCase()] || 'europe'
}
