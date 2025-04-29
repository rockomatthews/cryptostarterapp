import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPayment } from '@/lib/cryptoProcessingApi';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, currency, description, walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Create payment using CryptoProcessing.io API
    const cryptoPayment = await createPayment({
      amount,
      currency,
      walletAddress,
      description,
    });

    // Create payment intent in our database
    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        amount,
        currency,
        description,
        walletAddress,
        userId: session.user.id,
        status: 'pending',
        paymentId: cryptoPayment.id,
        apiResponse: JSON.stringify(cryptoPayment),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ...paymentIntent,
      paymentUrl: cryptoPayment.payment_url,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 