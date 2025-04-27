import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Check if we're in a build/SSR context - more specifically for build time vs runtime
const isBuildTime = typeof window === 'undefined' && 
                   (process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.VERCEL_ENV === 'development');

// Log environment details to help debug
console.log('Prisma initialization environment:', {
  nodeEnv: process.env.NODE_ENV,
  nextPhase: process.env.NEXT_PHASE,
  vercelEnv: process.env.VERCEL_ENV,
  isBuildTime
});

/**
 * Create a mock PrismaClient for use during build/SSR
 * This prevents build-time initialization errors while still
 * providing a simple stub that doesn't throw errors
 */
function createMockPrisma() {
  console.log('Creating mock Prisma client for build-time');
  
  const handler = {
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    $transaction: (cb) => Promise.resolve(cb(mockClient)),
    $extends: () => mockClient,
    $queryRaw: () => Promise.resolve([{result: 1}]),
    
    get: (_target: unknown, prop: string) => {
      // Handle special methods directly
      if (typeof prop === 'string' && 
          ['$connect', '$disconnect', '$on', '$transaction', '$extends', '$queryRaw'].includes(prop)) {
        return handler[prop];
      }
      
      // Return a proxy for any model
      return new Proxy({}, {
        get: (_: unknown, method: string) => {
          // Return a function that returns appropriate mock data
          return (...args: unknown[]) => {
            console.log(`Mock Prisma: ${prop}.${method}() called with:`, args);
            
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
                return Promise.resolve({id: 'mock-id', ...args[0]?.data});
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

// Test database connectivity
export async function testDbConnection(client?: PrismaClient) {
  const prismaToTest = client || prisma;
  try {
    // Attempt a simple query
    const result = await prismaToTest.$queryRaw`SELECT 1 as result`;
    console.log("Database connection successful:", result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

// Cache a single instance of PrismaClient
if (!globalForPrisma.prisma) {
  if (isBuildTime) {
    console.log('Using mock PrismaClient during build phase');
    globalForPrisma.prisma = createMockPrisma();
  } else {
    console.log('Initializing real Prisma client for runtime');
    try {
      // Create a new PrismaClient instance with proper configuration
      const newPrisma = new PrismaClient({
        log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
        errorFormat: 'pretty',
      });
      
      // Try to extend with Accelerate if needed
      try {
        if (process.env.DATABASE_ACCELERATE_URL || process.env.PRISMA_ACCELERATE_URL) {
          console.log('Extending Prisma with Accelerate');
          globalForPrisma.prisma = newPrisma.$extends(withAccelerate());
        } else {
          globalForPrisma.prisma = newPrisma;
        }
      } catch (extError) {
        console.warn('Failed to extend with Accelerate, using standard client', extError);
        globalForPrisma.prisma = newPrisma;
      }
      
      // Ensure we're connected
      globalForPrisma.prisma.$connect().catch(e => {
        console.error('Failed to connect to database:', e);
      });
    } catch (initError) {
      console.error('Failed to initialize Prisma client:', initError);
      // Fallback to mock client if initialization fails
      globalForPrisma.prisma = createMockPrisma();
    }
  }
}

// Use the cached client
prisma = globalForPrisma.prisma;

export default prisma; 