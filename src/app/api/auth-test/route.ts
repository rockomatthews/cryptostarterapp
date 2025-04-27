'use server';

import { NextResponse } from 'next/server';

// This endpoint will check NextAuth configuration without using Prisma
export async function GET() {
  const envVars = {
    nextAuthUrl: process.env.NEXTAUTH_URL || 'missing',
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || 'not set',
  };

  // This endpoint doesn't use Prisma, so it should work even if Prisma is broken
  return NextResponse.json({
    status: 'success',
    message: 'Auth configuration check',
    timestamp: new Date().toISOString(),
    config: envVars,
    expectedCallbackUrl: `${envVars.nextAuthUrl}/api/auth/callback/google`,
  });
} 