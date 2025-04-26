/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Next.js for edge compatibility
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  // Add rewrites to handle auth client redirects more gracefully
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 