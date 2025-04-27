import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

// Set runtime for faster execution
export const runtime = 'nodejs';

// Log information about the environment 
console.log('Auth.ts configuration:', {
  nodeEnv: process.env.NODE_ENV,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasSecret: Boolean(process.env.NEXTAUTH_SECRET),
  hasGoogleConfig: Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET),
  isBuildTime: process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
});

// Define auth configuration
const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // We're using JWT strategy since it works without a database
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/auth-error',
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session from JWT token
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const resolvedBaseUrl = baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
      
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

// Create a handler using the Next.js App Router standard format
const handler = NextAuth(authConfig);

// Export the handler functions
export { handler as GET, handler as POST }; 