// middleware.ts (en la raíz del proyecto)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/api/verify'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo verificar rutas protegidas
  if (!protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Obtener token de las cookies o header
  const token = request.cookies.get('session_token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized - No session token' },
      { status: 401 }
    )
  }

  // El API route verificará el token con Supabase
  // Solo pasamos la request si tiene token
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
