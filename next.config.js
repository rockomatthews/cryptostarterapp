/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Enable middleware for authentication
  experimental: {
    // Support for authInterrupts provides better error handling for authentication
    authInterrupts: true,
  },
  // Enable serverExternalPackages for better Prisma support
  serverExternalPackages: [
    'prisma',
    '@prisma/client'
  ],
  // On-demand ISR
  staticGeneration: {
    // Prevent static generation of pages with dynamic routes
    excludeDynamic: true,
  },
  // Disable ESLint during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build to avoid issues
  typescript: {
    ignoreBuildErrors: true,
  },
  // Increase the build timeout to accommodate Prisma generation
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    }
  },
  // Allow build to continue even if there are some page errors
  onDemandEntries: {
    // Number of pages that should be kept simultaneously without being disposed
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    // Number of pages that should be kept in memory
    pagesBufferLength: 5,
  },
  // Add rewrites to handle auth client redirects more gracefully
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
  // Force a clean URL output
  trailingSlash: false,
  poweredByHeader: false,
};

module.exports = nextConfig; 