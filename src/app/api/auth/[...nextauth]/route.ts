import NextAuth from "next-auth";
import { authOptions as baseAuthOptions } from "../../../../lib/authOptions";

// Detect build time vs runtime 
const isBuildTime = typeof window === 'undefined' && 
                   (process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.VERCEL_ENV === 'development');

// Function to get adapter dynamically to avoid build-time Prisma initialization
const getAdapter = async () => {
  // During build time, return a placeholder adapter
  if (isBuildTime) {
    console.log('[NextAuth] Build time detected, using mock adapter');
    return {
      // Minimal mock implementation
      createUser: async (userData: Record<string, unknown>) => ({ id: 'mock-id', ...userData }),
      getUser: async () => null,
      getUserByEmail: async () => null,
      getUserByAccount: async () => null,
      updateUser: async (userData: Record<string, unknown>) => ({ id: 'mock-id', ...userData }),
      deleteUser: async () => ({}),
      linkAccount: async (account: Record<string, unknown>) => account,
      unlinkAccount: async () => ({}),
      createSession: async (session: Record<string, unknown>) => session,
      getSessionAndUser: async () => null,
      updateSession: async (session: Record<string, unknown>) => session,
      deleteSession: async () => ({}),
      createVerificationToken: async (token: Record<string, unknown>) => token,
      useVerificationToken: async () => null,
    };
  }

  try {
    // Only import Prisma at runtime
    const { default: prisma } = await import("@/lib/prisma");
    const { PrismaAdapter } = await import("@auth/prisma-adapter");
    console.log('[NextAuth] Runtime detected, using PrismaAdapter');
    return PrismaAdapter(prisma);
  } catch (error) {
    console.error('[NextAuth] Failed to initialize PrismaAdapter:', error);
    throw error;
  }
};

// Create a handler that initializes NextAuth with dynamically loaded options
async function createHandler() {
  // Complete auth options with adapter
  const authOptions = {
    ...baseAuthOptions,
    adapter: await getAdapter(),
  };
  
  return NextAuth(authOptions);
}

// Use the handler wrapper for Next.js export
export async function GET(req: Request) {
  const handler = await createHandler();
  return handler.GET(req);
}

export async function POST(req: Request) {
  const handler = await createHandler();
  return handler.POST(req);
} 