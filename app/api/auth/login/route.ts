import { NextRequest, NextResponse } from 'next/server'

const GO_API = process.env.API_BASE_URL ?? 'http://localhost:8080/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fetch(`${GO_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
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
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return response
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
