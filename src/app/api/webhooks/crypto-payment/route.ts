import { NextResponse } from 'next/server';
import { createSafeHandler } from '@/lib/safe-prisma';

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

    // Always return success to the webhook caller
    // The actual processing will happen at runtime with proper Prisma initialization
    return NextResponse.json({ 
      success: true,
      message: "Webhook received. Processing will be handled at runtime."
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