import { NextResponse } from "next/server"
import { getChampionsByLane } from "@/lib/champion-lanes"

type Champion = {
  id: string
  key: string
  name: string
  tags: string[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lane = searchParams.get('lane')?.toLowerCase() || 'all'

  const version = "16.1.1"

  try {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/es_ES/champion.json`,
      { cache: "force-cache" }
    )

    const data = await res.json()
    const allChampions: Champion[] = Object.values(data.data)

    const validChampionNames = getChampionsByLane(lane)

    let champions = allChampions.filter(champ => 
      validChampionNames.includes(champ.name)
    )

    if (champions.length === 0) {
      champions = allChampions
    }

    const random = champions[Math.floor(Math.random() * champions.length)]

    return NextResponse.json({
      id: random.id,
      key: Number(random.key),
      name: random.name,
      tags: random.tags,
      lane: lane
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch champions" },
      { status: 500 }
    )
  }
}