import { NextResponse } from 'next/server';
import { prisma, getPrismaStatus } from '@/lib/prisma';

// Set Node.js runtime
export const runtime = 'nodejs';

// Define proper types
type ConnectionTest = {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
};

export async function GET() {
  try {
    // Get Prisma status
    const status = await getPrismaStatus();
    
    // Try to run a test query
    let connectionTest: ConnectionTest = { success: false, message: 'Not attempted' };
    try {
      // Simple query to test database connection
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      connectionTest = {
        success: true,
        message: 'Successfully connected to database',
        data: result
      };
    } catch (error) {
      connectionTest = {
        success: false,
        message: 'Failed to connect to database',
        error: String(error)
      };
    }
    
    return NextResponse.json({
      status,
      connectionTest,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        hasDbUrl: Boolean(process.env.DATABASE_URL)
      }
    });
  } catch (error) {
    console.error('Error in prisma-test-new:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test Prisma connection',
        message: String(error)
      },
      { status: 500 }
    );
  }
} 