import { NextRequest, NextResponse } from 'next/server'

const GO_API = process.env.API_BASE_URL ?? 'http://localhost:8080/api'

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('simpeg_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 })
  }

  try {
    const res = await fetch(`${GO_API}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
