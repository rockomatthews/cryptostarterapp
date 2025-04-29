import { NextResponse } from 'next/server';
import { createSafeHandler } from '@/lib/safe-prisma';
import { prisma } from '@/lib/prisma';
import { getPaymentStatus, convertToSol, transferToSolWallet } from '@/lib/cryptoProcessingApi';

// Set Node.js runtime
export const runtime = 'nodejs';

// Define interface for webhook payload
interface CryptoPaymentWebhookPayload {
  id?: string;
  transaction_id?: string;
  status?: string;
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Webhook handler for crypto payment events
 * This processes callbacks from the cryptoprocessing.io API
 */
export const POST = createSafeHandler('crypto-payment-webhook', async (request: Request) => {
  try {
    // Parse the webhook payload 
    const payload = await request.json() as CryptoPaymentWebhookPayload;
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const type = searchParams.get('type') || 'donation';
    
    console.log('Processing crypto payment webhook:', { transactionId, type, payload });

    // Find the payment intent in our database
    const paymentIntent = await prisma.paymentIntent.findFirst({
      where: {
        paymentId: payload.id,
      },
    });

    if (!paymentIntent) {
      console.error('Payment intent not found:', payload.id);
      return NextResponse.json({ 
        success: false,
        message: "Payment intent not found"
      });
    }

    // Get the latest payment status from CryptoProcessing.io
    const paymentStatus = await getPaymentStatus(payload.id as string);

    // Update payment intent status
    await prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: paymentStatus.status,
        apiResponse: JSON.stringify(paymentStatus),
        updatedAt: new Date(),
      },
    });

    // If payment is completed, convert to SOL and transfer to platform wallet
    if (paymentStatus.status === 'completed') {
      try {
        // Convert the payment to SOL
        const conversion = await convertToSol({
          amount: paymentIntent.amount,
          fromCurrency: paymentIntent.currency,
        });

        // Transfer to platform SOL wallet
        const transfer = await transferToSolWallet(paymentIntent.paymentId as string);

        // Update payment intent with conversion and transfer details
        await prisma.paymentIntent.update({
          where: { id: paymentIntent.id },
          data: {
            status: 'converted',
            apiResponse: JSON.stringify({
              ...paymentStatus,
              conversion,
              transfer,
            }),
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Error converting payment to SOL:', error);
        // Update payment intent with conversion error
        await prisma.paymentIntent.update({
          where: { id: paymentIntent.id },
          data: {
            status: 'conversion_failed',
            apiResponse: JSON.stringify({
              ...paymentStatus,
              conversionError: error instanceof Error ? error.message : 'Unknown error',
            }),
            updatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Payment processed successfully"
    });
  } catch (error) {
    console.error('Error processing crypto payment webhook:', error);
    
    // Return 200 even on error to prevent retries from the payment provider
    return NextResponse.json({ 
      success: true,
      message: "Webhook acknowledged with errors."
    });
  }
}); 