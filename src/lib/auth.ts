import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Create a direct instance of PrismaClient just for auth
// This ensures it's isolated from other Prisma instances
let prismaForAuth: PrismaClient;

try {
  // In production, always create a new instance
  prismaForAuth = new PrismaClient();
  // Try to apply Accelerate extension
  try {
    prismaForAuth = prismaForAuth.$extends(withAccelerate());
  } catch (extError) {
    console.warn('Failed to extend Prisma with Accelerate for auth:', extError);
  }
} catch (error) {
  console.error('Failed to create Prisma client for auth:', error);
  // Fallback to an empty object with methods that return empty results
  // This prevents build failures
  prismaForAuth = {
    user: {
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => ({}),
      update: async () => ({}),
    },
    account: {
      findFirst: async () => null,
      create: async () => ({}),
    },
    session: {
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    },
    // Add other models as needed
  } as unknown as PrismaClient;
}

// Ensure we have a proper URL for callbacks
const getBaseUrl = () => {
  // SSR should use the deployment URL, CSR can use the window location
  if (typeof window !== 'undefined') return ''; // Root relative URL for client-side
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  return 'https://cryptostarter.app'; // Fallback to production URL
};

// Configure NextAuth options with error handling
export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug logs for troubleshooting
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // Use a try-catch wrapper for the adapter to handle potential errors
  adapter: (() => {
    try {
      return PrismaAdapter(prismaForAuth);
    } catch (error) {
      console.error("PrismaAdapter initialization error:", error);
      // Return a minimal adapter to avoid breaking NextAuth
      return {
        createUser: async () => ({}),
        getUser: async () => null,
        getUserByAccount: async () => null,
        getUserByEmail: async () => null,
        linkAccount: async () => ({}),
        createSession: async () => ({}),
        getSessionAndUser: async () => null,
        updateSession: async () => ({}),
        deleteSession: async () => ({}),
        updateUser: async () => ({}),
      } as any;
    }
  })(),
  callbacks: {
    session: async ({ session, user }) => {
      try {
        if (session?.user && user?.id) {
          session.user.id = user.id;
        }
      } catch (error) {
        console.error("Error in session callback:", error);
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      // Log for debugging
      console.log("Redirect callback:", { url, baseUrl });
      
      // Use appropriate base URL
      const resolvedBaseUrl = baseUrl || getBaseUrl();
      
      // If the URL starts with the base URL, it's safe
      if (url.startsWith(resolvedBaseUrl)) {
        return url;
      }
      
      // Handle relative URLs 
      if (url.startsWith("/")) {
        return `${resolvedBaseUrl}${url}`;
      }
      
      // Default to the base URL if something unexpected happens
      return resolvedBaseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth-error', // Custom error page for auth errors
  },
}; 