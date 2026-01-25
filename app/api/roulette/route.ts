import { NextResponse } from "next/server"

type Champion = {
  id: string
  key: string
  name: string
}

export async function GET() {
  // versión fija (luego la podemos automatizar)
  const version = "14.1.1"

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/es_ES/champion.json`,
    { cache: "force-cache" } // importante
  )

  const data = await res.json()

  const champions: Champion[] = Object.values(data.data)

  const random =
    champions[Math.floor(Math.random() * champions.length)]

  return NextResponse.json({
     id: random.id,
  key: Number(random.key),
  name: random.name,
  })
}
