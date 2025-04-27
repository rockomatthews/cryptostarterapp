import { auth } from './auth';

// Export auth as middleware
export default auth;

// Specify protected routes requiring authentication
export const config = {
  matcher: [
    '/profile/:path*',
    '/create-campaign/:path*',
    '/dashboard/:path*',
    '/api/protected/:path*',
  ],
}; 