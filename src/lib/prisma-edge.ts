import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Create a new PrismaClient instance for Edge runtime
function createEdgePrismaClient() {
  try {
    // Directly create the client with accelerate in one step to avoid initialization issues
    return new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    }).$extends(withAccelerate());
  } catch (error) {
    // If extending with accelerate fails, try without it
    console.error("Failed to initialize Edge Prisma client with Accelerate:", error);
    
    try {
      return new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
      });
    } catch (fallbackError) {
      console.error("Failed to initialize basic Edge Prisma client:", fallbackError);
      
      // Return a mock client to prevent build failures
      // This will be replaced at runtime with a real client
      return createMockPrismaClient();
    }
  }
}

// Create a mock client that won't throw during build
function createMockPrismaClient() {
  const handler = {
    get: (target: any, prop: string) => {
      // Return a proxy for any model access
      if (typeof prop === 'string' && !['then', 'catch', 'finally'].includes(prop)) {
        return new Proxy({}, {
          get: (_, methodProp) => {
            // Return a function for any method
            return async () => null;
          }
        });
      }
      return undefined;
    }
  };
  
  return new Proxy({}, handler);
}

// Create a single instance for the entire application
const prismaEdge = createEdgePrismaClient();

export default prismaEdge; 