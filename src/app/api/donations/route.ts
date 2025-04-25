import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { processDonation } from '@/lib/cryptoApi';

export async function POST(request: Request) {
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
    
    // Process the donation
    const result = await processDonation({
      amount,
      currency,
      campaignId,
      userId: session.user.id,
      donorWalletAddress: walletAddress,
      message,
      anonymous
    });

    return NextResponse.json(result.contribution);
  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
} 