import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPayment, getEstimatedPrice, getMinimumPaymentAmount } from '@/lib/cryptoProcessingApi';

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

    // Get minimum payment amount
    const minAmount = await getMinimumPaymentAmount(currency);
    
    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Amount must be at least ${minAmount} ${currency}` },
        { status: 400 }
      );
    }

    // Get estimated price in SOL
    const estimatedSolAmount = await getEstimatedPrice(amount, currency, 'SOL');

    // Create payment using our crypto processing API
    const payment = await createPayment({
      amount,
      currency,
      description,
      walletAddress,
    });

    // Create payment intent in our database
    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        amount,
        currency,
        description,
        walletAddress,
        userId: session.user.id,
        status: payment.status,
        paymentId: payment.paymentId,
        apiResponse: JSON.stringify(payment),
        estimatedSolAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ...paymentIntent,
      paymentUrl: payment.paymentUrl,
      estimatedSolAmount,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 