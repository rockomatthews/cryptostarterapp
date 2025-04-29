import { NextResponse } from 'next/server';
import { createSafeHandler } from '@/lib/safe-prisma';
import { prisma } from '@/lib/prisma';
import { verifyIpnSignature } from '@/lib/nowPaymentsApi';

// Set Node.js runtime
export const runtime = 'nodejs';

// Define interface for webhook payload
interface NowPaymentsWebhookPayload {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  outcome_amount: number;
  outcome_currency: string;
  fee: {
    currency: string;
    depositFee: number;
    withdrawalFee: number;
    serviceFee: number;
  };
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Webhook handler for NOWPayments IPN notifications
 * This processes callbacks from the NOWPayments API
 */
export const POST = createSafeHandler('nowpayments-webhook', async (request: Request) => {
  try {
    // Parse the webhook payload 
    const payload = await request.json() as NowPaymentsWebhookPayload;
    
    // Get the signature from headers
    const signature = request.headers.get('x-nowpayments-sig');
    
    if (!signature) {
      console.error('Missing signature in webhook request');
      return NextResponse.json({ 
        success: false,
        message: "Missing signature"
      }, { status: 400 });
    }
    
    // Verify the signature
    if (!verifyIpnSignature(payload, signature)) {
      console.error('Invalid signature in webhook request');
      return NextResponse.json({ 
        success: false,
        message: "Invalid signature"
      }, { status: 400 });
    }
    
    console.log('Processing NOWPayments webhook:', payload);

    // Find the payment intent in our database
    const paymentIntent = await prisma.paymentIntent.findFirst({
      where: {
        paymentId: payload.payment_id.toString(),
      },
    });

    if (!paymentIntent) {
      console.error('Payment intent not found:', payload.payment_id);
      return NextResponse.json({ 
        success: false,
        message: "Payment intent not found"
      });
    }

    // Update payment intent status
    await prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: payload.payment_status,
        apiResponse: JSON.stringify(payload),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Payment processed successfully"
    });
  } catch (error) {
    console.error('Error processing NOWPayments webhook:', error);
    
    // Return 200 even on error to prevent retries from the payment provider
    return NextResponse.json({ 
      success: true,
      message: "Webhook acknowledged with errors."
    });
  }
}); 