import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

// Make sure Prisma Client is initialized properly
function getPrismaClient() {
  try {
    return prisma;
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw new Error("Failed to initialize authentication database connection");
  }
}

// Configure NextAuth options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrismaClient()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
}; 