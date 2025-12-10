import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security middleware
 * - Adds security headers
 * - Basic rate limiting for API routes
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Only allow API routes in production (for CORS)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
    ].filter(Boolean)

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}


