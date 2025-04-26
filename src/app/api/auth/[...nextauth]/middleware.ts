import { NextRequest } from 'next/server';

/**
 * This file is used to add logging and debugging for the auth routes
 * It's not directly imported, but will be bundled with the auth route
 */
export function middleware(req: NextRequest) {
  // Log request details for debugging auth issues
  const url = req.nextUrl.toString();
  const method = req.method;
  const isCallback = url.includes('/callback');
  const provider = isCallback ? url.split('/callback/')[1]?.split('?')[0] : 'unknown';
  
  console.log(`[Auth Debug] ${method} ${url}`, {
    isCallback,
    provider,
    query: Object.fromEntries(req.nextUrl.searchParams.entries()),
    headers: {
      userAgent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
    },
    env: {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      vercelUrl: process.env.VERCEL_URL,
    },
  });
  
  // Continue with normal request processing
  return null;
} 