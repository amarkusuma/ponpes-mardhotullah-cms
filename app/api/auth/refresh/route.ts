import { NextRequest, NextResponse } from 'next/server'

const GO_API = process.env.API_BASE_URL ?? 'http://localhost:8080/api'

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('simpeg_refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 })
  }

  try {
    const res = await fetch(`${GO_API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const data = await res.json()

    if (!res.ok) {
      const response = NextResponse.json(data, { status: res.status })
      response.cookies.delete('simpeg_access_token')
      response.cookies.delete('simpeg_refresh_token')
      return response
    }

    const { access_token, refresh_token } = data.data?.token ?? {}
    const response = NextResponse.json(data, { status: 200 })

    if (access_token) {
      response.cookies.set('simpeg_access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 6, // 6 hours
      })
    }

    if (refresh_token) {
      response.cookies.set('simpeg_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return response
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
