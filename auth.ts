import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// Log configuration details to help with debugging
console.log("Auth.ts configuration:", {
  nodeEnv: process.env.NODE_ENV,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  hasGoogleConfig: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
});

// Centralized NextAuth configuration - Next.js 15 pattern
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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