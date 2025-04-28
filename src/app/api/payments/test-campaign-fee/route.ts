import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CAMPAIGN_CREATION_FEE } from '@/lib/cryptoApi';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currency } = await request.json();
    
    // Create a test payment intent for the campaign creation fee
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: CAMPAIGN_CREATION_FEE,
        currency,
        description: 'Test Campaign Creation Fee',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create test payment intent');
    }

    const paymentIntent = await response.json();
    
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