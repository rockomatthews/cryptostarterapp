import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/cryptoProcessingApi';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const payload = await request.text();
    
    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(payload);
    const { paymentId, status } = data;

    // Update payment intent status
    await prisma.paymentIntent.update({
      where: {
        paymentId,
      },
      data: {
        status,
        apiResponse: JSON.stringify(data),
        updatedAt: new Date(),
      },
    });

    // If payment is successful, you can trigger additional actions here
    // For example, update campaign status, send notifications, etc.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 