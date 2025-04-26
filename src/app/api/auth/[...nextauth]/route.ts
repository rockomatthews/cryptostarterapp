import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { createFallbackHandler } from "./fallback";
import { testDbConnection } from "@/lib/prisma";

// Create the handler in a way that gracefully handles errors
const createHandler = () => {
  try {
    // Log environment details for debugging
    console.log("NextAuth initialization environment:", {
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasDb: !!process.env.DATABASE_URL,
      googleClientConfigured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      vercelEnv: process.env.VERCEL_ENV
    });

    // Test database connectivity before initializing NextAuth
    testDbConnection().then(isConnected => {
      console.log("Database connection test before NextAuth:", isConnected);
    }).catch(error => {
      console.error("Database test failed before NextAuth:", error);
    });
    
    // Try to initialize NextAuth
    const handler = NextAuth(authOptions);
    console.log("NextAuth initialized successfully");
    return handler;
  } catch (error) {
    console.error("NextAuth initialization error:", error);
    
    // Use our fallback handler when NextAuth initialization fails
    console.log("Using fallback auth handler due to initialization error");
    return createFallbackHandler();
  }
};

// Create the handler once, with error boundary
let handler;
try {
  handler = createHandler();
} catch (error) {
  console.error("Fatal error creating NextAuth handler:", error);
  handler = createFallbackHandler();
}

// Export the handler
export { handler as GET, handler as POST }; 