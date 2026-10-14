import { NextResponse } from 'next/server'
import { evaluateMatchVerification } from '@/lib/match-verification'
import { verifyAuth } from '@/lib/verify-jwt'

type SimulatedVerificationRequest = {
  expectedChampionId: number
  playedChampionId: number
  championPlayed: string
  won: boolean
  gameMode: string
  gameDuration: number
  stats: {
    kills: number
    deaths: number
    assists: number
    cs: number
    gold: number
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: SimulatedVerificationRequest = await request.json()
    const expectedChampionId = Number(body.expectedChampionId)
    const playedChampionId = Number(body.playedChampionId)
    const gameDuration = Number(body.gameDuration)
    const statValues = Object.values(body.stats || {}).map(Number)

    if (
      !Number.isInteger(expectedChampionId) || expectedChampionId <= 0 ||
      !Number.isInteger(playedChampionId) || playedChampionId <= 0 ||
      typeof body.championPlayed !== 'string' || !body.championPlayed.trim() ||
      typeof body.won !== 'boolean' ||
      typeof body.gameMode !== 'string' || !body.gameMode.trim() ||
      !Number.isFinite(gameDuration) || gameDuration < 0 ||
      statValues.some((value) => !Number.isFinite(value) || value < 0)
    ) {
      return NextResponse.json({ error: 'Invalid simulated match data' }, { status: 400 })
    }

    return NextResponse.json({
      ...evaluateMatchVerification(expectedChampionId, playedChampionId, body.won),
      championPlayed: body.championPlayed.trim(),
      championIdExpected: expectedChampionId,
      championIdPlayed: playedChampionId,
      matchId: `SIM-${Date.now()}`,
      gameMode: body.gameMode.trim(),
      gameDuration,
      stats: body.stats,
      simulated: true,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}