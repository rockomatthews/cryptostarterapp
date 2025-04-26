import { NextResponse } from "next/server";
import { createSafeHandler } from "@/lib/safe-prisma";
import { testDbConnection } from "@/lib/prisma";

// Enhanced diagnostic endpoint to check auth configuration
export const GET = createSafeHandler('auth-check', async () => {
  // Get environment variables related to auth
  const googleClientId = process.env.GOOGLE_CLIENT_ID ? "[Set]" : "[Missing]";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? "[Set]" : "[Missing]";
  const nextAuthUrl = process.env.NEXTAUTH_URL || "[Not Set]";
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? "[Set]" : "[Missing]";
  const vercelUrl = process.env.VERCEL_URL || "[Not Set]";
  const databaseUrl = process.env.DATABASE_URL ? "[Set]" : "[Missing]";
  
  // URLs that should be configured in Google OAuth
  const origin = typeof window !== 'undefined' ? window.location.origin : null;
  const baseUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}` || "https://cryptostarter.app";
  const expectedCallbackUrl = `${baseUrl}/api/auth/callback/google`;
  
  // Check database connectivity
  let dbConnected = false;
  try {
    dbConnected = await testDbConnection();
  } catch (error) {
    console.error("Database connection test failed:", error);
  }
  
  // Check cookie settings
  const isSecureCookies = process.env.NODE_ENV === 'production';
  const cookiePrefix = isSecureCookies ? '__Secure-' : '';
  
  // Run some diagnostics on the request
  let requestInfo = {};
  try {
    // This will only work client-side
    if (typeof document !== 'undefined') {
      requestInfo = {
        hasSessionCookie: document.cookie.includes(`${cookiePrefix}next-auth.session-token`),
        origin: window.location.origin,
        cookies: document.cookie ? "[Set]" : "[None]",
      };
    }
  } catch (_) {
    requestInfo = { error: "Unable to get request info" };
  }
  
  return NextResponse.json({
    message: "Auth Configuration",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || "[Not Set]",
    auth: {
      providers: {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      },
      urls: {
        nextAuthUrl,
        vercelUrl,
        baseUrl,
        expectedCallbackUrl,
        clientOrigin: origin,
      },
      configuration: {
        nextAuthSecret,
        useSecureCookies: isSecureCookies,
        cookiePrefix,
      },
      database: {
        url: databaseUrl,
        connected: dbConnected,
      }
    },
    request: requestInfo,
    hints: [
      "Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set correctly",
      "Verify that NEXTAUTH_URL is set to your domain (e.g., https://cryptostarter.app)",
      "Ensure NEXTAUTH_SECRET is set for secure cookies",
      `Confirm Google OAuth has ${expectedCallbackUrl} as an authorized redirect URI`,
      "Check that DATABASE_URL is correctly configured and accessible",
      "Verify your cookies are working correctly (check browser console for cookie issues)"
    ],
  });
}); 