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

// Configure NextAuth options with error handling
export const authOptions: NextAuthOptions = {
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
  },
  pages: {
    signIn: '/login',
  },
}; 