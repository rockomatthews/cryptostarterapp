import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { prisma, getPrismaStatus } from "@/lib/prisma";

// Runtime configuration for NextAuth
const nextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/login',
    error: '/auth-error',
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      const resolvedBaseUrl = baseUrl || process.env.NEXTAUTH_URL || "https://cryptostarter.app";
      
      if (url.startsWith(resolvedBaseUrl)) {
        return url;
      }
      
      if (url.startsWith("/")) {
        return `${resolvedBaseUrl}${url}`;
      }
      
      return resolvedBaseUrl;
    }
  },
  debug: process.env.NODE_ENV === 'development',
};

// Create handler with automatic fallback
const createHandler = () => {
  const { isInitialized, isBuildTime } = getPrismaStatus();
  
  // During build or when Prisma fails to initialize
  if (isBuildTime || !isInitialized) {
    console.log('[NextAuth] Using fallback handler due to build context or initialization failure');
    
    return {
      GET: async () => {
        return NextResponse.json(
          {
            error: "Authentication service unavailable during build",
            code: "AUTH_SERVICE_UNAVAILABLE",
          },
          { status: 503 }
        );
      },
      POST: async () => {
        return NextResponse.json(
          {
            error: "Authentication service unavailable during build",
            code: "AUTH_SERVICE_UNAVAILABLE",
          },
          { status: 503 }
        );
      },
    };
  }
  
  // Normal runtime with initialized Prisma
  console.log('[NextAuth] Using standard handler with PrismaAdapter');
  return NextAuth(nextAuthConfig);
};

// Create the handler once and cache it
const handler = createHandler();

// Export route handlers with error boundaries
export async function GET(req: NextRequest) {
  try {
    return await handler.GET(req);
  } catch (error) {
    console.error('[NextAuth] GET request error:', error);
    return NextResponse.json(
      { 
        error: "Authentication service error", 
        code: "AUTH_SERVICE_ERROR" 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handler.POST(req);
  } catch (error) {
    console.error('[NextAuth] POST request error:', error);
    return NextResponse.json(
      { 
        error: "Authentication service error", 
        code: "AUTH_SERVICE_ERROR" 
      }, 
      { status: 500 }
    );
  }
} 