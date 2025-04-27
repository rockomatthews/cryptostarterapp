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
      // Get the current hostname to determine if we're in development or production
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      // Use localhost URL for development, otherwise use the configured URL
      const resolvedBaseUrl = isLocalhost 
        ? 'http://localhost:3000' 
        : (baseUrl || process.env.NEXTAUTH_URL || "https://cryptostarter.app");
      
      console.log('NextAuth redirect:', { url, baseUrl, resolvedBaseUrl });
      
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
  // More detailed debugging in both development and production
  debug: true,
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