import { PrismaClient } from '../generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient, _prismaInitialized: boolean }

// Only initialize Prisma on the server side
const prismaClientSingleton = () => {
  if (typeof window === 'undefined') {
    return new PrismaClient().$extends(withAccelerate())
  }
  return null
}

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Function to check if Prisma is initialized
export async function getPrismaStatus() {
  // Return early if we're in the browser
  if (typeof window !== 'undefined') {
    return {
      initialized: false,
      error: 'Prisma cannot be used in the browser'
  }
}

  try {
    // If we already know Prisma is initialized, return that status
    if (globalForPrisma._prismaInitialized) {
      return {
        initialized: true,
        client: prisma
      };
    }
    
    console.log('[PRISMA] Checking Prisma status...');
    console.log(`[PRISMA] DATABASE_URL starts with: ${process.env.DATABASE_URL?.substring(0, 15)}...`);
    console.log(`[PRISMA] DIRECT_URL exists: ${Boolean(process.env.DIRECT_URL)}`);
    
    // Try a simple query to check if connection works
    if (process.env.NODE_ENV !== 'production') {
      // Only test connection on server side and non-production
      try {
        console.log('[PRISMA] Testing database connection with query...');
        await prisma.$queryRaw`SELECT 1`;
        globalForPrisma._prismaInitialized = true;
        console.log('[PRISMA] Test query successful!');
      } catch (err) {
        console.error('[PRISMA] Connection test failed:', err);
        globalForPrisma._prismaInitialized = false;
      }
    } else {
      // In production, always test the connection
      try {
        console.log('[PRISMA] Production: Testing database connection...');
        await prisma.$queryRaw`SELECT 1`;
        globalForPrisma._prismaInitialized = true;
        console.log('[PRISMA] Production: Database connection successful!');
      } catch (err) {
        console.error('[PRISMA] Production: Database connection failed:', err);
        globalForPrisma._prismaInitialized = false;
      }
    }
    
    return {
      initialized: globalForPrisma._prismaInitialized || false,
      client: prisma
    };
  } catch (error) {
    console.error('[PRISMA] Error checking Prisma status:', error);
    return {
      initialized: false,
      error: 'Failed to check Prisma status'
    };
  }
} 