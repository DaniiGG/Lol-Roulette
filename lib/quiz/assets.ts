export const QUIZ_DDRAGON_VERSION = '16.21.1'

const BASE = `https://ddragon.leagueoflegends.com/cdn/${QUIZ_DDRAGON_VERSION}`
const SPLASH_BASE = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash'

export function quizChampionSplash(ddragonKey: string): string {
  return `${SPLASH_BASE}/${ddragonKey}_0.jpg`
}

export function quizChampionIcon(ddragonKey: string): string {
  return `${BASE}/img/champion/${ddragonKey}.png`
}
