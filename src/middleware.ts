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
    const response = NextResponse.next();

    // Add CSP headers
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.walletconnect.com https://*.walletconnect.org; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https://*.walletconnect.com https://*.walletconnect.org; " +
      "font-src 'self'; " +
      "connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.vercel.app https://*.ngrok-free.app; " +
      "frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org; " +
      "frame-ancestors 'self' http://localhost:* https://*.pages.dev https://*.vercel.app https://*.ngrok-free.app https://secure-mobile.walletconnect.com https://secure-mobile.walletconnect.org;"
    );

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Add session cookie handling
    const sessionCookie = request.cookies.get('next-auth.session-token');
    if (sessionCookie) {
      response.headers.set('Set-Cookie', sessionCookie.toString());
    }

    return response;
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