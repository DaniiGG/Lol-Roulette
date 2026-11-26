export const roles = ['top', 'jungle', 'mid', 'adc', 'support'] as const
export type Role = (typeof roles)[number]
export type Player = { name: string; role?: Role; champion?: string }
export type Draw = [Player[], Player[]]
export type Champion = { id: string; name: string }

function shuffle<T>(items: readonly T[]) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }
  return shuffled
}

export function drawTeams(names: string[], champions: readonly Champion[], assignRoles: boolean): Draw {
  const players = shuffle(names)
  const picks = shuffle(champions)
  const split = Math.ceil(players.length / 2)
  const makeTeam = (offset: number, team: string[]) => {
    const positions = assignRoles ? shuffle(roles) : []
    return team.map((name, index) => ({
      name,
      role: positions[index],
      champion: picks[offset + index]?.id,
    }))
  }
  return [makeTeam(0, players.slice(0, split)), makeTeam(split, players.slice(split))]
}

export function readDraw(hash: string, champions: ReadonlyMap<string, Champion>): Draw | null {
  if (!hash.startsWith('#teams=') || hash.length > 18000) return null
  try {
    const teams: unknown = JSON.parse(decodeURIComponent(hash.slice('#teams='.length)))
    if (!Array.isArray(teams) || teams.length !== 2) return null
    const isTeam = (team: unknown): team is Player[] =>
      Array.isArray(team) && team.length >= 1 && team.length <= 5 && team.every(player =>
        player && typeof player.name === 'string' && player.name.trim().length > 0 &&
        player.name.length <= 50 &&
        (player.role === undefined || roles.includes(player.role)) &&
        (player.champion === undefined || champions.has(player.champion))
      )
    const [blue, red] = teams
    if (!isTeam(blue) || !isTeam(red) || Math.abs(blue.length - red.length) > 1) return null
    return [blue, red]
  } catch {
    return null
  }
}
