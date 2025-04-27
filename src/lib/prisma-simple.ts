import { PrismaClient } from '@prisma/client';

// Create a simple PrismaClient instance
let prisma: PrismaClient;

// Check if we're in build time
const isBuildTime = process.env.NODE_ENV === 'production' && 
  (process.env.NEXT_PHASE === 'phase-production-build');

// In build time, use a mock client
if (isBuildTime) {
  console.log('[PrismaSimple] Build-time detected, using mock client');
  prisma = {} as PrismaClient;
} else {
  // In runtime, use a real client
  if (process.env.NODE_ENV === 'production') {
    // In production, create a new instance
    prisma = new PrismaClient();
  } else {
    // In development, use global to avoid multiple instances
    const globalForPrisma = global as unknown as { prisma?: PrismaClient };
    
    if (!globalForPrisma.prisma) {
      console.log('[PrismaSimple] Creating new Prisma client instance');
      globalForPrisma.prisma = new PrismaClient({
        log: ['error', 'warn'],
      });
    } else {
      console.log('[PrismaSimple] Reusing existing Prisma client instance');
    }
    
    prisma = globalForPrisma.prisma;
  }
}

export default prisma; 