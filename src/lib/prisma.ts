import { PrismaClient } from '@prisma/client';

// Detect build time vs runtime
const isBuildTime = typeof window === 'undefined' && 
                   (process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.VERCEL_ENV === 'development');

// Initialize a singleton PrismaClient
function getClient() {
  // During build time, return an empty object
  if (isBuildTime) {
    console.log('[Prisma] Build-time detected, skipping initialization');
    return {} as PrismaClient;
  }

  try {
    // Use the generated client path which works in all environments including production
    console.log('[Prisma] Runtime detected, initializing client');
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    return client;
  } catch (error) {
    console.error('[Prisma] Failed to initialize client:', error);
    return {} as PrismaClient;
  }
}

// In development, we need to make sure Prisma Client isn't instantiated multiple times
// which causes too many connections
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Export client with proper singleton pattern for both development and production
const prisma = global.prisma || getClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Check if client is working
export function getPrismaStatus() {
  return {
    isInitialized: !isBuildTime && !!prisma,
    isBuildTime
  };
}

export default prisma;
export { prisma }; 