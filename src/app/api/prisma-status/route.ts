import { NextResponse } from 'next/server';
import { getPrismaStatus } from '@/lib/prisma';

// Set runtime for faster execution
export const runtime = 'nodejs';

export async function GET() {
  // Get Prisma status from the helper function
  const status = getPrismaStatus();
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...status
  });
} 