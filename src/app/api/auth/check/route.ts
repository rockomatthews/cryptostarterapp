import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma, getPrismaStatus } from '@/lib/prisma';

// Set runtime for faster execution
export const runtime = 'nodejs';

/**
 * API endpoint for checking authentication and database status
 */
export async function GET() {
  // Capture the current timestamp
  const timestamp = new Date().toISOString();
  
  // Get environment info
  const environment = process.env.NODE_ENV || 'unknown';
  const vercelEnv = process.env.VERCEL_ENV || 'unknown';
  
  // Collect auth configuration
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? 
    `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 3)}...${process.env.GOOGLE_CLIENT_SECRET.substring(process.env.GOOGLE_CLIENT_SECRET.length - 3)}` : 
    'missing';
  
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? 
    `${process.env.NEXTAUTH_SECRET.substring(0, 3)}...${process.env.NEXTAUTH_SECRET.substring(process.env.NEXTAUTH_SECRET.length - 3)}` : 
    'missing';
  
  const nextAuthUrl = process.env.NEXTAUTH_URL || '';
  const vercelUrl = process.env.VERCEL_URL || '';
  
  // Determine the actual base URL being used
  const baseUrl = process.env.NEXTAUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  // Expected callback URL that should be configured in Google OAuth console
  const expectedCallbackUrl = `${baseUrl}/api/auth/callback/google`;
  
  // Generate helpful troubleshooting hints based on the diagnostic results
  const hints: string[] = [];
  
  if (!googleClientId) {
    hints.push('Google Client ID is missing. Check your environment variables.');
  }
  
  if (!googleClientSecret || googleClientSecret === 'missing') {
    hints.push('Google Client Secret is missing. Check your environment variables.');
  }
  
  if (!nextAuthSecret || nextAuthSecret === 'missing') {
    hints.push('NextAuth Secret is missing. Generate a secure random string for NEXTAUTH_SECRET.');
  }
  
  if (!nextAuthUrl) {
    hints.push('NEXTAUTH_URL is not set. This should be your full deployment URL.');
  }
  
  // Check database connection
  let dbConnected = false;
  let dbErrorMessage = '';
  let databaseUrl = process.env.DATABASE_URL || '';
  
  // Hide the actual database password in the response
  if (databaseUrl) {
    try {
      const urlObj = new URL(databaseUrl);
      if (urlObj.password) {
        urlObj.password = '****';
        databaseUrl = urlObj.toString();
      }
    } catch {
      databaseUrl = 'Invalid URL format';
    }
  }
  
  // Check Prisma status
  const { isInitialized } = getPrismaStatus();
  
  // Test database connection
  try {
    if (isInitialized) {
      // Use the existing singleton connection
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } else {
      dbErrorMessage = 'Prisma client not initialized';
      dbConnected = false;
    }
  } catch (error) {
    dbConnected = false;
    dbErrorMessage = error instanceof Error ? error.message : String(error);
    hints.push(`Database connection failed: ${dbErrorMessage}`);
    console.error('Database connection error:', dbErrorMessage);
  }
  
  if (environment === 'production' && !dbConnected) {
    hints.push('Database connection failed. Check your DATABASE_URL and ensure your database is accessible.');
  }
  
  // Check if we're running in Vercel and NEXTAUTH_URL doesn't match VERCEL_URL
  if (vercelUrl && nextAuthUrl && !nextAuthUrl.includes(vercelUrl)) {
    hints.push(`NEXTAUTH_URL (${nextAuthUrl}) doesn't match VERCEL_URL (https://${vercelUrl}). Consider updating NEXTAUTH_URL.`);
  }
  
  // Check for secure cookies in production
  const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') || !!process.env.VERCEL_URL;
  if (environment === 'production' && !useSecureCookies) {
    hints.push('Secure cookies may not be used because NEXTAUTH_URL does not start with https://. This can cause authentication issues.');
  }
  
  // If no hints were generated, add a general one
  if (hints.length === 0) {
    hints.push('Your configuration looks good. Check if Google OAuth is correctly configured in Google Cloud Console.');
    hints.push('Ensure the authorized redirect URI in Google Console matches exactly: ' + expectedCallbackUrl);
  }
  
  // Get the headers
  const headersList = headers();
  const host = headersList.get('host') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  
  // Return diagnostic information
  return NextResponse.json({
    message: 'Auth diagnostics',
    timestamp,
    environment,
    vercelEnv,
    auth: {
      providers: {
        google: {
          clientId: googleClientId ? `${googleClientId.substring(0, 5)}...` : 'missing',
          clientSecret: googleClientSecret,
        },
      },
      urls: {
        nextAuthUrl,
        vercelUrl: vercelUrl ? `https://${vercelUrl}` : '',
        baseUrl,
        expectedCallbackUrl,
      },
      configuration: {
        nextAuthSecret,
        useSecureCookies,
        cookiePrefix: useSecureCookies ? '__Secure-' : '',
      },
      database: {
        url: databaseUrl,
        connected: dbConnected,
        initialized: isInitialized,
      },
    },
    request: {
      headers: {
        host,
        userAgent,
      },
    },
    hints,
  });
} 