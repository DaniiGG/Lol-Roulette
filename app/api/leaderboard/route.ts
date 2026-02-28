// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'xp' // xp, streak, challenges
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let orderBy = 'xp'
    let orderDirection = 'desc'

    switch (category) {
      case 'xp':
        orderBy = 'xp'
        break
      case 'streak':
        orderBy = 'current_streak'
        break
      case 'longest_streak':
        orderBy = 'longest_streak'
        break
      case 'challenges':
        orderBy = 'total_challenges_completed'
        break
      case 'level':
        orderBy = 'level'
        break
      default:
        orderBy = 'xp'
    }

    // Obtener usuarios ordenados
    const { data: users, error, count } = await supabase
      .from('users')
      .select('id, game_name, tag_line, level, xp, current_streak, longest_streak, total_challenges_completed, profile_icon_id', { count: 'exact' })
      .order(orderBy, { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Leaderboard error:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Formatear resultados con posición
    const leaderboard = users?.map((user, index) => ({
      rank: offset + index + 1,
      id: user.id,
      gameName: user.game_name,
      tagLine: user.tag_line,
      riotId: `${user.game_name}#${user.tag_line}`,
      level: user.level,
      xp: user.xp,
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
      totalChallenges: user.total_challenges_completed,
      profileIconId: user.profile_icon_id || 0
    })) || []

    return NextResponse.json({
      leaderboard,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      category
    })

  } catch (error: any) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}