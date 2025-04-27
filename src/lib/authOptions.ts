import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";

// Detect build time vs runtime
const isBuildTime = typeof window === 'undefined' && 
                   (process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.VERCEL_ENV === 'development');

// Function to get adapter dynamically to avoid build-time Prisma initialization
const getAdapter = async () => {
  // During build time, return a placeholder adapter
  if (isBuildTime) {
    console.log('[NextAuth] Build time detected, using mock adapter');
    return {
      // Minimal mock implementation
      createUser: async (userData: Record<string, unknown>) => ({ id: 'mock-id', ...userData }),
      getUser: async () => null,
      getUserByEmail: async () => null,
      getUserByAccount: async () => null,
      updateUser: async (userData: Record<string, unknown>) => ({ id: 'mock-id', ...userData }),
      deleteUser: async () => ({}),
      linkAccount: async (account: Record<string, unknown>) => account,
      unlinkAccount: async () => ({}),
      createSession: async (session: Record<string, unknown>) => session,
      getSessionAndUser: async () => null,
      updateSession: async (session: Record<string, unknown>) => session,
      deleteSession: async () => ({}),
      createVerificationToken: async (token: Record<string, unknown>) => token,
      useVerificationToken: async () => null,
    };
  }

  try {
    // Only import Prisma at runtime
    const { default: prisma } = await import("./prisma");
    console.log('[NextAuth] Runtime detected, using PrismaAdapter');
    return PrismaAdapter(prisma as PrismaClient);
  } catch (error) {
    console.error('[NextAuth] Failed to initialize PrismaAdapter:', error);
    throw error;
  }
};

// Auth configuration options
export const authOptions: NextAuthOptions = {
  // Adapter will be loaded dynamically at runtime
  adapter: undefined, // Will be set in handler
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth-error',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
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
  debug: process.env.NODE_ENV !== 'production',
  // Ensure cookies work correctly in all environments
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  }
}; 