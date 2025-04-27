/**
 * Utility to fix Prisma initialization issues
 */
import { PrismaClient } from '../generated/prisma';

// Define a global type
type GlobalWithPrisma = {
  _prismaInstance?: PrismaClient;
  _prismaInitialized?: boolean;
};

// Get the global object
const global = globalThis as unknown as GlobalWithPrisma;

// Create a new PrismaClient instance with proper error logging
export function createFreshPrismaClient() {
  try {
    // Create a new client instance
    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['error', 'warn'] 
        : ['error'],
      errorFormat: 'pretty'
    });
    
    // Store this client in global
    global._prismaInstance = prisma;
    global._prismaInitialized = true;
    
    console.log('[PrismaFix] Created fresh Prisma client');
    return prisma;
  } catch (error) {
    console.error('[PrismaFix] Failed to create Prisma client:', error);
    global._prismaInitialized = false;
    return null;
  }
}

// Get or create a Prisma client
export function getPrismaClient() {
  // Return existing instance if available
  if (global._prismaInstance) {
    return global._prismaInstance;
  }
  
  // Create new instance
  return createFreshPrismaClient();
}

// Testing function to check if Prisma is working
export async function testPrismaConnection() {
  const prisma = getPrismaClient();
  if (!prisma) {
    return { success: false, message: 'Failed to create Prisma client' };
  }
  
  try {
    // Try to use the client
    await prisma.$connect();
    
    // Try a simple query to verify connection
    const result = await prisma.$executeRaw`SELECT 1 AS test`;
    
    return { 
      success: true, 
      message: 'Successfully connected to database',
      result
    } as const;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to connect to database',
      error: String(error)
    } as const;
  }
}

// Export a default instance
export default getPrismaClient(); 