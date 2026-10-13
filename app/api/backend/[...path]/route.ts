import { NextRequest, NextResponse } from 'next/server'

const GO_API = process.env.API_BASE_URL ?? 'http://localhost:8080/api'

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const accessToken = request.cookies.get('simpeg_access_token')?.value

  const url = new URL(`${GO_API}/${path.join('/')}`)
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value))

  const headers: Record<string, string> = {}
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const isMultipart = request.headers.get('Content-Type')?.includes('multipart/form-data')
  if (!isMultipart) headers['Content-Type'] = 'application/json'
  // For multipart, do NOT set Content-Type — fetch sets it with the boundary automatically

  const isReadMethod = ['GET', 'HEAD'].includes(request.method)
  let body: BodyInit | undefined
  if (!isReadMethod) {
    body = isMultipart ? await request.blob() : await request.text()
  }

  // For multipart: forward the original Content-Type header (contains boundary)
  if (isMultipart && request.headers.get('Content-Type')) {
    headers['Content-Type'] = request.headers.get('Content-Type')!
  }

  try {
    const res = await fetch(url.toString(), { method: request.method, headers, body })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Backend unreachable' }, { status: 502 })
  }
}

export const GET    = proxy
export const POST   = proxy
export const PUT    = proxy
export const DELETE = proxy
export const PATCH  = proxy
