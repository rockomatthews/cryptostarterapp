import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { createSafePrismaProxy } from './safe-prisma';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

// This is to prevent "The Edge Runtime does not support Node.js 'process'" errors
const isProduction = process.env.NODE_ENV === 'production';

// Function to create a new Prisma client
function createPrismaClient() {
  try {
    const client = new PrismaClient({
      log: ['error'],
    });
    
    // Apply Accelerate extension if available
    try {
      return client.$extends(withAccelerate());
    } catch (extError) {
      console.warn('Failed to extend Prisma with Accelerate:', extError);
      return client;
    }
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    // Return a safety proxy that won't crash the build
    return createSafePrismaProxy() as PrismaClient;
  }
}

// Try to use global instance (development) or create a new one (production)
let prisma: PrismaClient;

try {
  prisma = global.prismaInstance || (isProduction ? createPrismaClient() : createPrismaClient());
  
  // Set the global instance for development environment
  if (!isProduction && global.prismaInstance === undefined) {
    global.prismaInstance = prisma;
  }
} catch (error) {
  console.error('Critical Prisma initialization error:', error);
  // Use our proxy as a safety fallback
  prisma = createSafePrismaProxy() as PrismaClient;
}

export default prisma; 