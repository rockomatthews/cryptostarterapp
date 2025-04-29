import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPayment } from '@/lib/nowPaymentsApi';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to continue' },
        { status: 401 }
      );
    }

    const { currency } = await request.json();

    if (!currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a test payment using NOWPayments
    const payment = await createPayment({
      amount: 10, // Test amount
      currency,
      description: 'Test campaign creation fee',
      orderId: `test_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      paymentIntentId: payment.payment_id,
      amount: payment.price_amount,
      currency: payment.price_currency,
      paymentUrl: payment.invoice_url,
      payAddress: payment.pay_address,
    });
  } catch (error) {
    console.error('Error in test-campaign-fee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 