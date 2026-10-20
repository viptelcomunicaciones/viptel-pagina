import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.viptelcomunicaciones.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflarestorage.com',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  async rewrites() {
    if (process.env.R2_PUBLIC_URL) {
      const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/+$/, '')
      return [
        {
          source: '/api/media/file/:filename*',
          destination: `${publicUrl}/:filename*`,
        },
      ]
    }
    return []
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false,
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
