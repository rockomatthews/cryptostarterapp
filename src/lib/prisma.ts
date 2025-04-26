import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

// Create a new PrismaClient instance with Accelerate, wrapped in try-catch
function createPrismaClient() {
  try {
    const prisma = new PrismaClient();
    
    try {
      // Apply Accelerate extension
      return prisma.$extends(withAccelerate());
    } catch (extError) {
      console.warn("Failed to extend Prisma with Accelerate:", extError);
      return prisma; // Return regular Prisma client if extension fails
    }
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw error; // Re-throw to ensure the error is not silently ignored
  }
}

// Use different creation strategies for development vs production
const prisma = global.prisma || createPrismaClient();

// Ensure caching in development only, not in production
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma; 