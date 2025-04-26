import { NextResponse } from 'next/server';

// Set Node.js runtime
export const runtime = 'nodejs';

/**
 * Simplified API route for production build
 * This is a temporary solution to bypass Prisma initialization issues during build
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;
    
    // Return mock data for build
    return NextResponse.json({
      message: `Contributions endpoint active for campaign: ${campaignId}`,
      success: true
    });
  } catch (error) {
    console.error('Error in contributions endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 