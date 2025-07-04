/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SHIPROCKET_COMPANY_ID: process.env.SHIPROCKET_COMPANY_ID,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://arister.onrender.com/api/:path*', // Proxy to Express backend
      },
    ];
  },
}

export default nextConfig
