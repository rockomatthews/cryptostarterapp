import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma, { testDbConnection } from "./prisma";
import { PrismaClient } from "@prisma/client";

// Detect build time vs runtime
const isBuildTime = typeof window === 'undefined' && 
                   (process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.VERCEL_ENV === 'development');

// Logging helper
const logAuthInfo = (message: string, data?: any) => {
  console.log(`[NextAuth] ${message}`, data || '');
};

// Create a direct instance of PrismaClient just for auth
// This ensures it's isolated from other Prisma instances
let prismaForAuth: PrismaClient;

try {
  // Log the initialization attempt
  logAuthInfo('Initializing auth-specific Prisma client', {
    buildTime: isBuildTime,
    env: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });

  if (isBuildTime) {
    // During build, use the mock client
    logAuthInfo('Using mock Prisma client for auth during build');
    prismaForAuth = prisma;
  } else {
    // In runtime, create a dedicated instance
    logAuthInfo('Creating dedicated Prisma client for auth at runtime');
    
    // In production, create with optimized settings
    prismaForAuth = new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Test the connection
    testDbConnection(prismaForAuth)
      .then(isConnected => logAuthInfo(`Auth Prisma connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`))
      .catch(err => logAuthInfo('Auth Prisma connection test error', err));
  }
} catch (error) {
  logAuthInfo('Failed to create Prisma client for auth:', error);
  
  // Create a minimal mock client as fallback
  prismaForAuth = {
    user: {
      findUnique: async () => {
        logAuthInfo('Mock auth Prisma: user.findUnique called');
        return null;
      },
      findFirst: async () => {
        logAuthInfo('Mock auth Prisma: user.findFirst called');
        return null;
      },
      create: async (data) => {
        logAuthInfo('Mock auth Prisma: user.create called', data);
        return { id: 'mock-user-id', ...data };
      },
      update: async (data) => {
        logAuthInfo('Mock auth Prisma: user.update called', data);
        return { id: 'mock-user-id', ...data };
      },
    },
    account: {
      findFirst: async () => {
        logAuthInfo('Mock auth Prisma: account.findFirst called');
        return null;
      },
      create: async (data) => {
        logAuthInfo('Mock auth Prisma: account.create called', data);
        return { id: 'mock-account-id', ...data };
      },
    },
    session: {
      findUnique: async () => {
        logAuthInfo('Mock auth Prisma: session.findUnique called');
        return null;
      },
      create: async (data) => {
        logAuthInfo('Mock auth Prisma: session.create called', data);
        return { id: 'mock-session-id', ...data };
      },
      update: async (data) => {
        logAuthInfo('Mock auth Prisma: session.update called', data);
        return data;
      },
      delete: async () => {
        logAuthInfo('Mock auth Prisma: session.delete called');
        return {};
      },
    },
  } as unknown as PrismaClient;
}

// Ensure we have a proper URL for callbacks
const getBaseUrl = () => {
  // Log current URL resolution context
  const context = {
    hasWindow: typeof window !== 'undefined',
    vercelUrl: process.env.VERCEL_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    host: typeof window !== 'undefined' ? window.location.origin : undefined
  };
  logAuthInfo('Getting base URL with context:', context);

  // SSR should use the deployment URL, CSR can use the window location
  if (typeof window !== 'undefined') return window.location.origin;
  
  // For Vercel deployment
  if (process.env.VERCEL_URL) {
    // Ensure proper https protocol
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Explicitly configured URL takes precedence
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Final fallback
  return 'https://cryptostarter.app';
};

// Configure NextAuth options with error handling
export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug logs for troubleshooting
  logger: {
    error(code, metadata) {
      logAuthInfo(`Error: ${code}`, metadata);
    },
    warn(code) {
      logAuthInfo(`Warning: ${code}`);
    },
    debug(code, metadata) {
      logAuthInfo(`Debug: ${code}`, metadata);
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // Use a try-catch wrapper for the adapter to handle potential errors
  adapter: (() => {
    try {
      logAuthInfo('Creating PrismaAdapter with prismaForAuth client');
      return PrismaAdapter(prismaForAuth);
    } catch (error) {
      logAuthInfo('PrismaAdapter initialization error:', error);
      
      // Return a minimal adapter to avoid breaking NextAuth
      return {
        createUser: async (data) => {
          logAuthInfo('Mock adapter: createUser called', data);
          return { id: 'mock-user-id', ...data };
        },
        getUser: async (id) => {
          logAuthInfo('Mock adapter: getUser called', { id });
          return null;
        },
        getUserByAccount: async (providerAccount) => {
          logAuthInfo('Mock adapter: getUserByAccount called', providerAccount);
          return null;
        },
        getUserByEmail: async (email) => {
          logAuthInfo('Mock adapter: getUserByEmail called', { email });
          return null;
        },
        linkAccount: async (data) => {
          logAuthInfo('Mock adapter: linkAccount called', data);
          return data;
        },
        createSession: async (data) => {
          logAuthInfo('Mock adapter: createSession called', data);
          return data;
        },
        getSessionAndUser: async (sessionToken) => {
          logAuthInfo('Mock adapter: getSessionAndUser called', { sessionToken });
          return null;
        },
        updateSession: async (data) => {
          logAuthInfo('Mock adapter: updateSession called', data);
          return data;
        },
        deleteSession: async (sessionToken) => {
          logAuthInfo('Mock adapter: deleteSession called', { sessionToken });
        },
        updateUser: async (data) => {
          logAuthInfo('Mock adapter: updateUser called', data);
          return { id: 'mock-user-id', ...data };
        },
      };
    }
  })(),
  callbacks: {
    session: async ({ session, user }) => {
      logAuthInfo('Session callback called', { hasUser: !!user, hasSession: !!session });
      
      try {
        if (session?.user && user?.id) {
          session.user.id = user.id;
          logAuthInfo('Added user ID to session');
        }
      } catch (error) {
        logAuthInfo('Error in session callback:', error);
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      // Get detailed logging information
      logAuthInfo('Redirect callback:', { 
        url, 
        baseUrl, 
        configuredBaseUrl: getBaseUrl() 
      });
      
      // Use appropriate base URL, prefer explicit baseUrl
      const resolvedBaseUrl = baseUrl || getBaseUrl();
      logAuthInfo('Resolved baseUrl:', resolvedBaseUrl);
      
      // Handle absolute URLs from the same origin
      if (url.startsWith(resolvedBaseUrl)) {
        logAuthInfo('URL starts with baseUrl, returning as is:', url);
        return url;
      }
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        const result = `${resolvedBaseUrl}${url}`;
        logAuthInfo('Relative URL detected, returning:', result);
        return result;
      }
      
      // For any external URLs, check if they're allowed (not implemented here)
      if (url.startsWith('http')) {
        logAuthInfo('External URL detected, redirecting to home instead');
        return resolvedBaseUrl;
      }
      
      // Default fallback for safety
      logAuthInfo('Using fallback redirect to base URL');
      return resolvedBaseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth-error', // Custom error page for auth errors
  },
  // Explicitly set this to better handle cookie issues
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}; 