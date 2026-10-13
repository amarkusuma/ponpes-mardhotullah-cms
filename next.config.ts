import type { NextConfig } from 'next'

const BACKEND_URL = process.env.API_BASE_URL?.replace('/api', '') ?? 'http://localhost:8080'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
