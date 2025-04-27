import { PrismaClient } from '../generated/prisma'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient, _prismaInitialized: boolean }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Function to check if Prisma is initialized
export async function getPrismaStatus() {
  try {
    // If we already know Prisma is initialized, return that status
    if (globalForPrisma._prismaInitialized) {
      return {
        initialized: true,
        client: prisma
      };
    }
    
    // Try a simple query to check if connection works
    if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
      // Only test connection on server side and non-production
      try {
        await prisma.$queryRaw`SELECT 1`;
        globalForPrisma._prismaInitialized = true;
      } catch (err) {
        console.error('Prisma connection test failed:', err);
        globalForPrisma._prismaInitialized = false;
      }
    }
    
    return {
      initialized: globalForPrisma._prismaInitialized || false,
      client: prisma
    };
  } catch (error) {
    console.error('Error checking Prisma status:', error);
    return {
      initialized: false,
      error: 'Failed to check Prisma status'
    };
  }
} 