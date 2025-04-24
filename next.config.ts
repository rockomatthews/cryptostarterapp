import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This will ignore the ESLint error during builds
    ignoreDuringBuilds: true,
    dirs: ['src'],
  }
};

export default nextConfig;
