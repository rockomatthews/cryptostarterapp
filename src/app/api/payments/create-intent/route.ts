import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPayment, getEstimatedPrice, getMinimumPaymentAmount } from '@/lib/nowPaymentsApi';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, currency, description } = await request.json();

    // Get minimum payment amount
    const minAmount = await getMinimumPaymentAmount(currency, 'SOL');
    
    if (amount < minAmount.min_amount) {
      return NextResponse.json(
        { error: `Amount must be at least ${minAmount.min_amount} ${currency}` },
        { status: 400 }
      );
    }

    // Get estimated price in SOL
    const estimate = await getEstimatedPrice({
      amount,
      fromCurrency: currency,
      toCurrency: 'SOL'
    });

    // Create payment using NOWPayments API
    const payment = await createPayment({
      amount,
      currency,
      description,
      orderId: `order_${Date.now()}`,
    });

    // Create payment intent in our database
    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        amount,
        currency,
        description,
        userId: session.user.id,
        status: payment.payment_status,
        paymentId: payment.payment_id.toString(),
        apiResponse: JSON.stringify(payment),
        estimatedSolAmount: estimate.estimated_amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ...paymentIntent,
      paymentUrl: payment.invoice_url,
      estimatedSolAmount: estimate.estimated_amount,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 