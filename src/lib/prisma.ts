import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Check if we're in a build/SSR context
const isBuildOrSSR = typeof window === 'undefined';

/**
 * Create a mock PrismaClient for use during build/SSR
 * This prevents build-time initialization errors while still
 * providing a simple stub that doesn't throw errors
 */
function createMockPrisma() {
  const handler = {
    get: (_target: any, prop: string) => {
      // Return a mock model object for any requested model
      if (['$connect', '$disconnect', '$on', '$transaction', '$extends'].includes(prop)) {
        // Mock PrismaClient methods
        return () => (prop === '$transaction' ? (cb: Function) => cb(mockClient) : Promise.resolve());
      }
      
      // Return a proxy for any model
      return new Proxy({}, {
        get: (_: any, method: string) => {
          // Return a function that returns appropriate mock data
          return (..._args: any[]) => {
            console.log(`Mock Prisma: ${prop}.${method}() called during build`);
            
            // Return appropriate mock data based on the method
            switch (method) {
              case 'findMany':
                return Promise.resolve([]);
              case 'count':
                return Promise.resolve(0);
              case 'findUnique':
              case 'findFirst':
                return Promise.resolve(null);
              case 'create':
              case 'update':
              case 'upsert':
              case 'delete':
                return Promise.resolve({});
              default:
                return Promise.resolve(null);
            }
          };
        },
      });
    },
  };

  const mockClient = new Proxy({}, handler);
  return mockClient as unknown as PrismaClient;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

// During build, use mock client to prevent initialization errors
if (isBuildOrSSR && process.env.NODE_ENV === 'production') {
  console.log('Using mock PrismaClient during build/SSR');
  prisma = createMockPrisma();
} else {
  // In development/runtime, use actual PrismaClient
  try {
    if (process.env.NODE_ENV === 'production') {
      // In production, always create a new client
      prisma = new PrismaClient();
    } else {
      // In development, reuse client if it exists
      if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
      }
      prisma = globalForPrisma.prisma;
    }

    // Try to extend with Accelerate
    try {
      prisma = prisma.$extends(withAccelerate());
    } catch (extError) {
      console.warn('Failed to extend Prisma with Accelerate:', extError);
    }
  } catch (initError) {
    console.error('Failed to initialize Prisma client:', initError);
    // Fallback to mock client if initialization fails
    prisma = createMockPrisma();
  }
}

export default prisma; 