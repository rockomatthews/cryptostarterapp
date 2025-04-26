// Fallback handler for auth route when Prisma fails to initialize
import type { NextRequest } from 'next/server';

/**
 * Simple fallback handler for auth API routes
 * Used when Prisma fails to initialize with NextAuth
 */
export function createFallbackHandler() {
  async function GET(_req: NextRequest) {
    return new Response(
      JSON.stringify({ 
        error: 'Auth service temporarily unavailable',
        message: 'The authentication service is currently initializing or unavailable',
        status: 'error',
        retryAfter: 30
      }),
      { 
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '30'
        } 
      }
    );
  }

  async function POST(_req: NextRequest) {
    return new Response(
      JSON.stringify({ 
        error: 'Auth service temporarily unavailable',
        message: 'The authentication service is currently initializing or unavailable',
        status: 'error',
        retryAfter: 30
      }),
      { 
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '30'
        } 
      }
    );
  }

  return { GET, POST };
}

export default createFallbackHandler; 