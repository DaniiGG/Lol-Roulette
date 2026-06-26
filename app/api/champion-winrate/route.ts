import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/verify-jwt'

const RIOT_API_KEY = process.env.RIOT_API_KEY!
const MATCH_COUNT = 30

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

export async function POST(request: Request) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { puuid, region, gameMode } = await request.json()
    if (!puuid || !region) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (puuid !== auth.puuid) {
      return NextResponse.json({ error: 'Cannot fetch winrate for another user' }, { status: 403 })
    }

    const routing = getPlatformRegion(region)

    const matchIdsRes = await fetch(
      `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=${MATCH_COUNT}`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        next: { revalidate: 0 }
      }
    )

    if (!matchIdsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch match history' }, { status: matchIdsRes.status })
    }

    const matchIds: string[] = await matchIdsRes.json()

    if (!matchIds.length) {
      return NextResponse.json({ champions: [] })
    }

    const matchDetails = await Promise.all(
      matchIds.map(async (matchId) => {
        try {
          const res = await fetch(
            `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            {
              headers: { 'X-Riot-Token': RIOT_API_KEY },
              next: { revalidate: 0 }
            }
          )
          if (!res.ok) return null
          return await res.json()
        } catch {
          return null
        }
      })
    )

    const championStats: Record<string, { wins: number; games: number }> = {}

    const validModes = gameMode === 'aram' ? ['ARAM'] : gameMode === 'classic' ? ['CLASSIC'] : ['ARAM', 'CLASSIC', 'URF', 'CHERRY', 'NEXUSBLITZ']

    for (const match of matchDetails) {
      if (!match?.info?.participants) continue
      if (!validModes.includes(match.info.gameMode)) continue

      const participant = match.info.participants.find(
        (p: any) => p.puuid === puuid
      )
      if (!participant) continue

      const champName: string = participant.championName
      if (!championStats[champName]) {
        championStats[champName] = { wins: 0, games: 0 }
      }
      championStats[champName].games++
      if (participant.win) {
        championStats[champName].wins++
      }
    }

    const champions = Object.entries(championStats)
      .map(([championName, stats]) => ({
        championName,
        wins: stats.wins,
        losses: stats.games - stats.wins,
        total: stats.games,
        winrate: Math.round((stats.wins / stats.games) * 100)
      }))
      .sort((a, b) => b.winrate - a.winrate)

    return NextResponse.json({ champions })
  } catch (error) {
    console.error('Champion winrate error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch champion winrate' },
      { status: 500 }
    )
  }
}
