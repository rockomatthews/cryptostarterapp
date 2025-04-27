import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "../generated/prisma";

// Detect build time vs runtime
const isBuildTime = typeof window === 'undefined' && 
                   (process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.VERCEL_ENV === 'development');

// Logging helper
const logAuthInfo = (message: string, data?: any) => {
  console.log(`[NextAuth] ${message}`, data || '');
};

// Prisma client for auth that's initialized lazily to avoid build issues
let prismaForAuth: PrismaClient | null = null;

// Get or initialize Prisma for auth
const getPrismaForAuth = (): PrismaClient | null => {
  if (isBuildTime) {
    logAuthInfo('Build time detected, using mock client');
    return null;
  }
  
  if (!prismaForAuth) {
    try {
      logAuthInfo('Initializing Prisma client for auth at runtime');
      prismaForAuth = new PrismaClient({
        log: ['error', 'warn'],
        errorFormat: 'pretty'
      });
    } catch (error) {
      logAuthInfo('Failed to initialize Prisma client for auth:', error);
      return null;
    }
  }
  
  return prismaForAuth;
};

// Ensure we have a proper URL for callbacks
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  return 'https://cryptostarter.app';
};

// Configure NextAuth options
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // Use dynamic adapter to avoid build-time issues
  adapter: (() => {
    const prisma = getPrismaForAuth();
    
    if (!prisma) {
      // Return a basic mock adapter for build time
      logAuthInfo('Using mock auth adapter for build');
      return {
        createUser: async (data) => ({ id: 'mock-id', ...data }),
        getUser: async () => null,
        getUserByEmail: async () => null,
        getUserByAccount: async () => null,
        updateUser: async (data) => ({ id: 'mock-id', ...data }),
        linkAccount: async (data) => data,
        createSession: async (data) => data,
        getSessionAndUser: async () => null,
        updateSession: async (data) => data,
        deleteSession: async () => {},
      };
    }
    
    // Use real PrismaAdapter at runtime
    logAuthInfo('Using real PrismaAdapter for auth');
    return PrismaAdapter(prisma);
  })(),
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user && user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
    redirect: ({ url, baseUrl }) => {
      const resolvedBaseUrl = baseUrl || getBaseUrl();
      if (url.startsWith(resolvedBaseUrl)) return url;
      if (url.startsWith("/")) return `${resolvedBaseUrl}${url}`;
      return resolvedBaseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth-error',
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV !== 'production',
}; 