import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Error handling middleware - catches errors in API routes
export async function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  try {
    // Continue to the next middleware/route handler
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware caught error:', error);
    
    // Return a graceful error response
    return new Response(
      JSON.stringify({
        error: 'Service temporarily unavailable',
        message: 'The service encountered an error. Please try again later.',
        path: request.nextUrl.pathname,
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
}

// Configure the middleware
export const config = {
  // Only run on API routes
  matcher: '/api/:path*',
}; 