import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CAMPAIGN_CREATION_FEE } from '@/lib/cryptoApi';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currency, walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get the request origin for constructing the absolute URL
    const origin = request.headers.get('origin') || request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${origin}`;
    
    // Create a test payment intent for the campaign creation fee
    const response = await fetch(`${baseUrl}/api/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: CAMPAIGN_CREATION_FEE,
        currency,
        description: 'Test Campaign Creation Fee',
        walletAddress,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create test payment intent');
    }

    const paymentIntent = await response.json();
    
    // Log the transaction
    await prisma.transactionLog.create({
      data: {
        type: 'donation',
        amount: CAMPAIGN_CREATION_FEE,
        currency,
        status: 'pending',
        apiResponse: JSON.stringify(paymentIntent),
      },
    });
    
    return NextResponse.json({
      success: true,
      paymentIntent,
      message: 'Test payment intent created successfully',
      fee: CAMPAIGN_CREATION_FEE,
      currency
    });
  } catch (error) {
    console.error('Error creating test payment:', error);
    return NextResponse.json(
      { error: 'Failed to create test payment' },
      { status: 500 }
    );
  }
} 