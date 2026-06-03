const BASE = ''

async function api(path: string, body: any, token: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API error: ${res.status}`)
  }
  return res.json()
}

export function createChallenge(token: string, data: {
  champion_id: string | number
  champion_name: string
  lane: string
  reroll_count: number
}) {
  return api('/api/challenges', { action: 'create', ...data }, token)
}

export function rerollChallenge(token: string, data: {
  challenge_id: string
  champion_id: string | number
  champion_name: string
  lane: string
  reroll_count: number
}) {
  return api('/api/challenges', { action: 'reroll', ...data }, token)
}

export function completeChallenge(token: string, data: {
  champion_name?: string
  match_id?: string
  match_data?: any
}) {
  return api('/api/challenges', { action: 'complete', ...data }, token)
}

export function completeChallengeById(token: string, data: {
  challenge_id: string
  match_id?: string
  match_data?: any
}) {
  return api('/api/challenges', { action: 'complete_by_id', ...data }, token)
}

export function failChallenge(token: string, data: {
  challenge_id: string
  match_id?: string
  match_data?: any
}) {
  return api('/api/challenges', { action: 'fail', ...data }, token)
}

export function updateUserStats(token: string, data: {
  xp?: number
  level?: number
  current_streak?: number
  longest_streak?: number
  total_challenges_completed?: number
}) {
  return api('/api/users', { action: 'update_stats', ...data }, token)
}

export function resetStreak(token: string) {
  return api('/api/users', { action: 'reset_streak' }, token)
}

export function addXp(token: string, xp: number) {
  return api('/api/users', { action: 'add_xp', xp }, token)
}

export function unlockAchievement(token: string, data: {
  achievement_type: string
  achievement_name: string
  achievement_description?: string
}) {
  return api('/api/achievements', { action: 'unlock', ...data }, token)
}