import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Paths that should only be accessible when logged in
  const authRequiredPaths = [
    '/profile',
    '/profile/edit',
    '/create-campaign'
  ];

  // Check if the path requires authentication
  const isAuthRequired = authRequiredPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If the path requires auth and the user is not logged in, redirect to login
  if (isAuthRequired && !session) {
    // Safely encode the current URL to redirect back after login
    const encodedUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedUrl}`, request.url));
  }

  // If the user is already logged in and tries to access login page, redirect to profile
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/profile/:path*',
    '/create-campaign/:path*',
    '/login'
  ],
}; 