import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['cubicle-ds'],
  async headers() {
    return [
      {
        source: '/api/blogs/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://hyperfantasy.co' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        source: '/api/backlog/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://zopavo.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.2', '192.168.1.13', '172.20.10.2'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
