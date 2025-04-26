import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

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
    throw error;
  }
}

// In development, use a global variable to avoid instantiating multiple clients
// In production, always create a new instance
const prisma = global.prismaInstance || (isProduction ? createPrismaClient() : createPrismaClient());

// Set the global instance for development environment
if (!isProduction && global.prismaInstance === undefined) {
  global.prismaInstance = prisma;
}

export default prisma; 