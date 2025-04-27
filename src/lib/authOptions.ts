import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// Auth configuration options
export const authOptions: AuthOptions = {
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
}; 