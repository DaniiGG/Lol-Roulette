// lib/auth.ts
// Sistema de autenticación mejorado usando PUUID de Riot

const RIOT_API_KEY = process.env.RIOT_API_KEY!

interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

interface Summoner {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  summonerLevel: number
}

/**
 * Obtener PUUID desde Riot ID (gameName#tagLine)
 * Este es el ID único e inmutable del usuario
 */
export async function getPUUIDFromRiotID(
  gameName: string, 
  tagLine: string,
  region: 'americas' | 'europe' | 'asia' = 'europe'
): Promise<RiotAccount | null> {
  try {
    const res = await fetch(
      `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        next: { revalidate: 3600 } // Cache 1 hora
      }
    )

    if (!res.ok) {
      if (res.status === 404) {
        return null // Usuario no encontrado
      }
      throw new Error('Failed to fetch Riot account')
    }

    const data = await res.json()
    return {
      puuid: data.puuid,
      gameName: data.gameName,
      tagLine: data.tagLine
    }
  } catch (error) {
    console.error('Error fetching PUUID:', error)
    return null
  }
}

/**
 * Obtener datos del summoner desde PUUID
 */
export async function getSummonerByPUUID(
  puuid: string,
  platform: string = 'euw1'
): Promise<Summoner | null> {
  try {
    const res = await fetch(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        next: { revalidate: 3600 }
      }
    )

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error('Failed to fetch summoner')
    }

    return await res.json()
  } catch (error) {
    console.error('Error fetching summoner:', error)
    return null
  }
}

/**
 * Mapeo de región API a plataforma
 */
export function getPlatformFromRegion(region: string): string {
  const mapping: Record<string, string> = {
    'br1': 'br1',
    'eun1': 'eun1',
    'euw1': 'euw1',
    'jp1': 'jp1',
    'kr': 'kr',
    'la1': 'la1',
    'la2': 'la2',
    'na1': 'na1',
    'oc1': 'oc1',
    'ph2': 'ph2',
    'ru': 'ru',
    'sg2': 'sg2',
    'th2': 'th2',
    'tr1': 'tr1',
    'tw2': 'tw2',
    'vn2': 'vn2'
  }
  
  return mapping[region.toLowerCase()] || 'euw1'
}

/**
 * Mapeo de plataforma a región de routing
 */
export function getRoutingFromPlatform(platform: string): 'americas' | 'europe' | 'asia' {
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
  
  return mapping[platform.toLowerCase()] || 'europe'
}