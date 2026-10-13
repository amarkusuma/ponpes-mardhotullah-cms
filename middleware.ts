import { NextRequest, NextResponse } from 'next/server'

// ── Route definitions ────────────────────────────────────────────────────────

const PUBLIC_PATHS = ['/', '/login', '/api/auth']

const ROLE_PATHS: Record<string, string[]> = {
  admin:  ['/admin'],
  guru:   ['/guru'],
  santri: ['/santri'],
  wali:   ['/wali'],
}

const ROLE_HOME: Record<string, string> = {
  admin:  '/admin/dashboard',
  guru:   '/guru/dashboard',
  santri: '/santri/dashboard',
  wali:   '/wali/dashboard',
}

// ── JWT decode (edge-safe, no signature check — backend validates on API calls) ─

interface JWTPayload {
  sub: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
  exp: number
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return null
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as JWTPayload
    // Cek apakah token sudah expired
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function getRequiredRole(pathname: string): string | null {
  for (const [role, paths] of Object.entries(ROLE_PATHS)) {
    if (paths.some((p) => pathname.startsWith(p))) return role
  }
  return null
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lewati route publik & file statis
  if (isPublicPath(pathname)) return NextResponse.next()

  const accessToken = request.cookies.get('simpeg_access_token')?.value

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = decodeJWT(accessToken)
  if (!payload) {
    // Token tidak valid / expired → coba refresh (dilakukan oleh client)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('expired', '1')
    const response = NextResponse.redirect(loginUrl)
    // Hapus token tidak valid dari cookie
    response.cookies.delete('simpeg_access_token')
    return response
  }

  const userRoles = payload.roles ?? []
  const requiredRole = getRequiredRole(pathname)

  if (!requiredRole) return NextResponse.next()

  // Admin boleh akses semua role area
  if (userRoles.includes('admin')) return NextResponse.next()

  if (!userRoles.includes(requiredRole)) {
    // Redirect ke home role yang sesuai
    const primaryRole = userRoles[0] as string
    const home = ROLE_HOME[primaryRole] ?? '/login'
    return NextResponse.redirect(new URL(home, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
