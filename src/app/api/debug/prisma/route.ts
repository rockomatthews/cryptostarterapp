import { NextResponse } from 'next/server';
import { prisma, getPrismaStatus } from '@/lib/prisma';
import { headers } from 'next/headers';

// Set runtime for Node.js environment
export const runtime = 'nodejs';

export async function GET(req: Request) {
  // Check for a secret token to prevent public access
  const headersList = headers();
  const authorization = headersList.get('authorization');
  const authToken = process.env.DEBUG_AUTH_TOKEN;
  
  if (!authorization || authorization !== `Bearer ${authToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get detailed environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      nextPhase: process.env.NEXT_PHASE,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlStart: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.split('://')[0]}://${process.env.DATABASE_URL.split('@')[0].split(':')[1]}:***@${process.env.DATABASE_URL.split('@')[1].slice(0, 15)}...` 
        : 'Not set',
      vercel: {
        isVercel: Boolean(process.env.VERCEL),
        environment: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
      }
    };
    
    // Get Prisma status
    const prismaStatus = await getPrismaStatus();
    
    // Test a simple query
    let connectionTest = { success: false, message: 'Not attempted' };
    try {
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      connectionTest = {
        success: true,
        message: 'Successfully connected to database',
        data: result
      };
    } catch (error: any) {
      connectionTest = {
        success: false,
        message: 'Failed to connect to database',
        error: error.message
      };
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      prismaStatus,
      connectionTest,
      environment: envInfo
    });
  } catch (error: any) {
    console.error('Error in Prisma debug endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get Prisma status',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 