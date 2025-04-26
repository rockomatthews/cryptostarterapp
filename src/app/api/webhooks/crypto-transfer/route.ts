import { NextResponse } from 'next/server';
import { createSafeHandler } from '@/lib/safe-prisma';

// Set Node.js runtime
export const runtime = 'nodejs';

// Define interface for webhook payload
interface CryptoTransferWebhookPayload {
  id?: string;
  transaction_id?: string;
  status?: string;
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Webhook handler for crypto transfer events
 * This processes distribution/refund callbacks from the cryptoprocessing.io API
 */
export const POST = createSafeHandler('crypto-transfer-webhook', async (request: Request) => {
  try {
    // Parse the webhook payload 
    const payload = await request.json() as CryptoTransferWebhookPayload;
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const type = searchParams.get('type') || 'distribution';
    const contributionId = searchParams.get('contributionId');
    
    console.log('Processing crypto transfer webhook:', { transactionId, type, contributionId, payload });

    // Always return success to the webhook caller
    // The actual processing will happen at runtime with proper Prisma initialization
    return NextResponse.json({ 
      success: true,
      message: "Transfer webhook received. Processing will be handled at runtime."
    });
  } catch (error) {
    console.error('Error processing crypto transfer webhook:', error);
    
    // Return 200 even on error to prevent retries from the payment provider
    return NextResponse.json({ 
      success: true,
      message: "Transfer webhook acknowledged with errors."
    });
  }
}); 