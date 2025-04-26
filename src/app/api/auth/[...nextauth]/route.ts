import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { createFallbackHandler } from "./fallback";

// Create the handler in a way that gracefully handles errors
const createHandler = () => {
  try {
    // Try to initialize NextAuth
    const handler = NextAuth(authOptions);
    console.log("NextAuth initialized successfully");
    return handler;
  } catch (error) {
    console.error("NextAuth initialization error:", error);
    
    // Use our fallback handler when NextAuth initialization fails
    console.log("Using fallback auth handler");
    return createFallbackHandler();
  }
};

// Create the handler once
const handler = createHandler();

// Export the handler
export { handler as GET, handler as POST }; 