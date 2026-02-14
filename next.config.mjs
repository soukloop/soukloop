/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.DIST_DIR || '.next',
  // Enable standalone output for Docker
  output: 'standalone',

  // Image optimization
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Webpack configuration - keeping for compatibility if needed, but Next 16 prefers Turbopack
  // To silence the error, we can explicitly opt-out of Turbopack by not providing a turbopack config
  // or by passing --webpack flag. However, the error says "custom webpack configurations may need to be migrated".
  // Let's try to keep webpack for now and see if we can disable the error or if we need to adjust.
  // Actually, the error says: "you can silence this error by ... simply setting an empty turbopack config"
  turbopack: {},

  webpack: (config, { isServer, dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ['**/node_modules', '**/.git', '**/.next', '**/*.log', '**/*.txt', '**/projectStructure.json', '**/projectStructure.cache.json'],
      }
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      { source: '/FAQs', destination: '/faqs', permanent: true },
      { source: '/contactus', destination: '/contact-us', permanent: true },
      { source: '/editprofile', destination: '/edit-profile', permanent: true },
      { source: '/howtousepoints', destination: '/how-to-use-points', permanent: true },
      { source: '/privacypolicy', destination: '/privacy-policy', permanent: true },
      { source: '/refundsandreturns', destination: '/refunds-and-returns', permanent: true },
      { source: '/rewardpoints', destination: '/reward-points', permanent: true },
      { source: '/sellerprofile', destination: '/seller-profile', permanent: true },
      { source: '/trackorders', destination: '/track-orders', permanent: true },
      { source: '/userdashboard', destination: '/dashboard', permanent: true },
      { source: '/userprofile', destination: '/profile', permanent: true },
      { source: '/terms', destination: '/terms-and-conditions', permanent: true },
      { source: '/order-details', destination: '/order-tracking', permanent: true },
      { source: '/become-seller', destination: '/become-a-seller', permanent: true },
      { source: '/productdetails/:id', destination: '/product/:id', permanent: true },
    ]
  }
}

export default nextConfig
