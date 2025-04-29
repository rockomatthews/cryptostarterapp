import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyIpnSignature } from '@/lib/nowPaymentsApi';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-nowpayments-sig');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify the signature
    if (!verifyIpnSignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update payment intent status in database
    const paymentIntent = await prisma.paymentIntent.update({
      where: {
        paymentId: payload.payment_id.toString(),
      },
      data: {
        status: payload.payment_status,
        apiResponse: JSON.stringify(payload),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 