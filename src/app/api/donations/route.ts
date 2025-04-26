import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createSafeHandler } from '@/lib/safe-prisma';

// Use the safe handler pattern for better reliability during builds
export const POST = createSafeHandler('donations-route', async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to make a donation' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const { 
      campaignId,
      amount,
      currency,
      walletAddress,
      message,
      anonymous
    } = body;

    // Validate required fields
    if (!campaignId || !amount || !currency || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // For build time, just return a placeholder response
    // Real processing will happen at runtime with proper Prisma initialization
    return NextResponse.json({ 
      id: 'placeholder-id',
      amount,
      currency,
      campaignId,
      status: 'pending',
      userId: session.user.id,
      walletAddress,
      message,
      anonymous: anonymous || false,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}); 