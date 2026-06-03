import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export function verifyAuth(request: Request): { userId: string; puuid: string; region?: string } | null {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId, puuid: decoded.puuid, region: decoded.region }
  } catch {
    return null
  }
}
