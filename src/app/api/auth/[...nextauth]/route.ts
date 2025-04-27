import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Use NextAuth directly instead of importing handlers
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 