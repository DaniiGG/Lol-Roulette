import { NextResponse } from 'next/server'
import { championIconUrl } from '@/lib/champion-data'
import { getRouletteChampions } from '@/lib/roulette-champions'

export function GET(request: Request) {
  const lane = new URL(request.url).searchParams.get('lane')?.toLowerCase() || 'all'
  const champions = getRouletteChampions(lane)
  const champion = champions[Math.floor(Math.random() * champions.length)]

  return NextResponse.json({
    id: champion.id,
    key: champion.key,
    name: champion.name.es,
    tags: champion.tags,
    lane,
    imageUrl: championIconUrl(champion.id),
  })
}
