import { NextResponse } from 'next/server';
import { getPrismaStatus } from '@/lib/prisma';
import prisma from '@/lib/prisma';

// Set runtime for faster execution
export const runtime = 'nodejs';

// Run Prisma regeneration
export async function GET() {
  try {
    // Try to regenerate Prisma
    const result = await regeneratePrisma();
    
    // Test Prisma connection
    let connectionTest = { success: false, message: 'Not attempted' };
    try {
      // Try to use the Prisma client
      const count = await prisma.$queryRaw`SELECT 1 as count`;
      connectionTest = {
        success: true,
        message: 'Successfully connected to database',
        result: count
      };
    } catch (error) {
      connectionTest = {
        success: false,
        message: 'Failed to connect to database',
        error: String(error)
      };
    }
    
    // Get Prisma status
    const status = getPrismaStatus();
    
    return NextResponse.json({
      status,
      connectionTest,
      regenerateResult: result,
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        nextPhase: process.env.NEXT_PHASE,
        dbUrl: Boolean(process.env.DATABASE_URL),
        nextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
        nextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET)
      }
    });
  } catch (error) {
    console.error('Error in prisma-test:', error);
    return NextResponse.json(
      { error: 'Could not test Prisma initialization', message: String(error) },
      { status: 500 }
    );
  }
}

// Helper to manually trigger Prisma generation
async function regeneratePrisma() {
  try {
    // Use dynamic import
    const childProcess = await import('child_process');
    
    // First cleanup Prisma artifacts
    try {
      childProcess.execSync('rm -rf node_modules/.prisma').toString();
    } catch (error) {
      console.warn('Failed to cleanup Prisma artifacts:', error);
    }
    
    // Then regenerate
    const output = childProcess.execSync('npx prisma generate').toString();
    
    // Set global status
    (global as any)._prismaInitialized = true;
    
    return { success: true, output };
  } catch (error) {
    return { success: false, error: String(error) };
  }
} 