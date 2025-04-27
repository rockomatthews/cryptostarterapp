import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | null;
  _prismaInitializing: boolean;
}

function getPrismaClient() {
  // Don't create the client during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping Prisma initialization during build')
    return null
  }

  try {
    if (!globalForPrisma.prisma && !globalForPrisma._prismaInitializing) {
      globalForPrisma._prismaInitializing = true
      console.log('Initializing new PrismaClient')
      globalForPrisma.prisma = new PrismaClient({
        log: ['error'],
      })
      globalForPrisma._prismaInitializing = false
    }
    return globalForPrisma.prisma
  } catch (e) {
    console.error('Failed to initialize Prisma client:', e)
    globalForPrisma._prismaInitializing = false
    return null
  }
}

export const prisma = getPrismaClient()

export function isPrismaInitialized() {
  return globalForPrisma.prisma !== null && globalForPrisma.prisma !== undefined
} 