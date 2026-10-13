import { NextRequest, NextResponse } from 'next/server'

const GO_API = process.env.API_BASE_URL ?? 'http://localhost:8080/api'

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('simpeg_access_token')?.value
  const refreshToken = request.cookies.get('simpeg_refresh_token')?.value

  try {
    if (refreshToken) {
      await fetch(`${GO_API}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    }
  } catch {
    // proceed with cookie clearing even if backend call fails
  }

  const response = NextResponse.json({ success: true, message: 'Logged out' })
  response.cookies.delete('simpeg_access_token')
  response.cookies.delete('simpeg_refresh_token')
  return response
}
