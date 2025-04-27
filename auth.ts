import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";

// Detect build time vs runtime
const isBuildTime = typeof window === 'undefined' && 
                   (process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.VERCEL_ENV === 'development');

// Create a mock adapter for build time
const getMockAdapter = () => {
  return {
    createUser: async (data: any) => ({ id: 'mock-id', ...data }),
    getUser: async () => null,
    getUserByEmail: async () => null,
    getUserByAccount: async () => null,
    updateUser: async (data: any) => ({ id: 'mock-id', ...data }),
    deleteUser: async () => ({}),
    linkAccount: async (data: any) => data,
    unlinkAccount: async () => ({}),
    createSession: async (data: any) => data,
    getSessionAndUser: async () => null,
    updateSession: async (data: any) => data,
    deleteSession: async () => ({}),
    createVerificationToken: async (data: any) => data,
    useVerificationToken: async () => null,
  };
};

// Log configuration details to help with debugging
console.log("Auth.ts configuration:", {
  nodeEnv: process.env.NODE_ENV,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  hasGoogleConfig: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  isBuildTime
});

// For build time, use a mock adapter
let adapter: any;
if (isBuildTime) {
  console.log('Using mock adapter for build');
  adapter = getMockAdapter();
} else {
  try {
    // For runtime, use dynamic import of Prisma
    // Note: This will be executed during initialization, 
    // which happens after build time
    import("@/lib/prisma").then((module) => {
      adapter = PrismaAdapter(module.default as PrismaClient);
    }).catch(err => {
      console.error('Failed to load Prisma adapter:', err);
      adapter = getMockAdapter();
    });
  } catch (error) {
    console.error('Error initializing adapter:', error);
    adapter = getMockAdapter();
  }
}

// Centralized NextAuth configuration - Next.js 15 pattern
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
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
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user && user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      // Handle URL redirects
      const resolvedBaseUrl = baseUrl || process.env.NEXTAUTH_URL || "https://cryptostarter.app";
      
      // Handle absolute URLs from the same origin
      if (url.startsWith(resolvedBaseUrl)) {
        return url;
      }
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${resolvedBaseUrl}${url}`;
      }
      
      // Default to base URL for safety
      return resolvedBaseUrl;
    }
  },
  debug: process.env.NODE_ENV === 'development',
}); 