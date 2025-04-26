import { PrismaClient } from '@prisma/client';

// This is needed to tell TypeScript about the global variable
// We use var because let/const aren't valid in this context for globals
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use a unique client depending on the environment
export const prisma = getClient();

function getClient() {
  // In production, create a new client
  if (process.env.NODE_ENV === 'production') {
    // For Vercel deploys, we need to handle the Prisma initialization specifically
    try {
      return new PrismaClient();
    } catch (e) {
      console.error('Failed to create Prisma client in production:', e);
      throw new Error('Database connection failed');
    }
  }
  
  // In development, use a global variable to prevent multiple prisma clients
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  
  return global.prisma;
} 