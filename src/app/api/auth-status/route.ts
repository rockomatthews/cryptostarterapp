import { NextResponse } from 'next/server';

// Set runtime for faster execution
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check the environment for NextAuth configuration
    const authInfo = {
      nextAuthUrl: Boolean(process.env.NEXTAUTH_URL) && process.env.NEXTAUTH_URL,
      nextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
      googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
      googleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV
    };
    
    return NextResponse.json(authInfo);
  } catch (error) {
    console.error('Error in auth-status:', error);
    return NextResponse.json(
      { error: 'Could not check auth configuration', message: String(error) },
      { status: 500 }
    );
  }
} 