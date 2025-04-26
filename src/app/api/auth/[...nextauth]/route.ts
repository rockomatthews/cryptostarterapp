import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Wrap the handler in a try-catch to prevent build failures
let handler;
try {
  handler = NextAuth(authOptions);
} catch (error) {
  console.error("NextAuth initialization error:", error);
  // Return an empty handler that just returns 500
  handler = {
    GET: async () => new Response("Auth service unavailable", { status: 500 }),
    POST: async () => new Response("Auth service unavailable", { status: 500 }),
  };
}

export { handler as GET, handler as POST }; 