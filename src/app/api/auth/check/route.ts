import { NextResponse } from "next/server";

// Simple diagnostic endpoint to check auth configuration
export async function GET() {
  // Get environment variables related to auth
  const googleClientId = process.env.GOOGLE_CLIENT_ID ? "[Set]" : "[Missing]";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? "[Set]" : "[Missing]";
  const nextAuthUrl = process.env.NEXTAUTH_URL || "[Not Set]";
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? "[Set]" : "[Missing]";
  const vercelUrl = process.env.VERCEL_URL || "[Not Set]";
  
  // URLs that should be configured in Google OAuth
  const baseUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}` || "https://cryptostarter.app";
  const expectedCallbackUrl = `${baseUrl}/api/auth/callback/google`;
  
  return NextResponse.json({
    message: "Auth Configuration",
    environment: process.env.NODE_ENV,
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
      },
      configuration: {
        nextAuthSecret,
      },
    },
    hints: [
      "Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set correctly",
      "Verify that NEXTAUTH_URL is set to your domain (e.g., https://cryptostarter.app)",
      "Ensure NEXTAUTH_SECRET is set for secure cookies",
      `Confirm Google OAuth has ${expectedCallbackUrl} as an authorized redirect URI`,
    ],
  });
} 