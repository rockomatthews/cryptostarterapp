import { NextResponse } from 'next/server';
import prismaClient, { testPrismaConnection } from '@/lib/prisma-fix';

// Set runtime for faster execution
export const runtime = 'nodejs';

// Test the Prisma fix utility
export async function GET() {
  try {
    // Test connection
    const connectionTest = await testPrismaConnection();
    
    // Check client status
    const clientStatus = {
      clientExists: Boolean(prismaClient),
      clientType: prismaClient ? typeof prismaClient : 'undefined',
      clientMethods: prismaClient ? Object.keys(prismaClient).filter(k => typeof (prismaClient as any)[k] === 'function') : [],
      globalStatus: {
        prismaInstance: Boolean((globalThis as any)._prismaInstance),
        prismaInitialized: Boolean((globalThis as any)._prismaInitialized)
      }
    };
    
    return NextResponse.json({
      connectionTest,
      clientStatus,
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        dbUrl: Boolean(process.env.DATABASE_URL)
      }
    });
  } catch (error) {
    console.error('Error in prisma-fix-test:', error);
    return NextResponse.json(
      { error: 'Could not test Prisma fix', message: String(error) },
      { status: 500 }
    );
  }
} 