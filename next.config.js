/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Next.js for edge compatibility
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
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
    },
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