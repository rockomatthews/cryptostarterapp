import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Log environment information before initialization
console.log("NextAuth environment:", {
  nodeEnv: process.env.NODE_ENV, 
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  hasGoogleConfig: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
});

// Simple handler for Next.js App Router
// This is the recommended approach from the NextAuth docs
const handler = NextAuth(authOptions);

// Export the handler
export { handler as GET, handler as POST }; 