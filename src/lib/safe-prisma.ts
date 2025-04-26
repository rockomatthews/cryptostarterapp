/**
 * A utility to safely use Prisma in Next.js API routes
 * Provides fallback behavior when Prisma fails to initialize
 */

// Function to create a safe response handler
export function createSafeHandler(routeName: string, handler: Function) {
  return async (...args: any[]) => {
    try {
      // Try to run the original handler
      return await handler(...args);
    } catch (error) {
      console.error(`Error in ${routeName}:`, error);
      
      // Return a standard error response
      return new Response(
        JSON.stringify({
          error: 'Service temporarily unavailable',
          message: 'The service is currently unavailable. Please try again later.',
          status: 'error',
          path: routeName,
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '30',
          },
        }
      );
    }
  };
}

// Safe wrapper for PrismaClient methods
export function createSafePrismaProxy() {
  const safePrismaHandler = {
    get: (target: any, prop: string) => {
      // If the property exists on the target, return it
      if (prop in target) {
        return target[prop];
      }
      
      // For any non-existent property, return a proxy object
      // that returns null or empty objects for any method call
      return new Proxy({}, {
        get: (_, methodProp) => {
          // Return a function that simulates the method
          if (typeof methodProp === 'string') {
            return (..._: any[]) => {
              console.warn(`Safe Prisma: Method ${methodProp} called on non-existent model ${prop}`);
              
              // Different methods return different fallback values
              if (['findUnique', 'findFirst', 'findMany'].includes(methodProp)) {
                return methodProp === 'findMany' ? [] : null;
              }
              
              if (['create', 'update', 'upsert'].includes(methodProp)) {
                return {};
              }
              
              return null;
            };
          }
          return null;
        }
      });
    }
  };
  
  return new Proxy({}, safePrismaHandler);
} 