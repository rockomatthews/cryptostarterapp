import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define interface for webhook payload
interface CryptoPaymentWebhookPayload {
  id?: string;
  transaction_id?: string;
  status?: string;
  [key: string]: string | number | boolean | object | undefined; // More specific types
}

/**
 * Webhook handler for CryptoProcessing.io payment confirmations
 * This endpoint receives callbacks when a crypto payment status changes
 */
export async function POST(request: Request) {
  try {
    // Parse the webhook payload
    const payload: CryptoPaymentWebhookPayload = await request.json();
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const type = searchParams.get('type');
    
    console.log('Received crypto payment webhook:', { transactionId, type, payload });
    
    // Verify webhook signature if the API provides one
    // This is a security check to ensure the webhook is from CryptoProcessing.io
    // const signature = request.headers.get('x-signature');
    // if (!validateSignature(payload, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    // Different handling based on payment type
    if (type === 'campaign_fee') {
      // Handle campaign creation fee payment
      await handleCampaignFeePayment(payload);
    } else if (transactionId) {
      // Handle donation payment
      await handleDonationPayment(transactionId, payload);
    } else {
      return NextResponse.json(
        { error: 'Invalid webhook parameters' },
        { status: 400 }
      );
    }
    
    // Always return 200 OK to the webhook caller
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing crypto payment webhook:', error);
    
    // Log the error but still return 200 to prevent retries
    // Many webhook providers will retry failed webhooks
    return NextResponse.json({ success: true });
  }
}

/**
 * Handle a donation payment webhook
 */
async function handleDonationPayment(transactionLogId: string, payload: CryptoPaymentWebhookPayload) {
  // Get the transaction status from the payload
  const paymentStatus = payload.status || '';
  const transactionHash = payload.transaction_id || payload.id || '';
  
  // Find the transaction log
  const transactionLog = await prisma.transactionLog.findUnique({
    where: { id: transactionLogId },
    include: { 
      contribution: true,
      campaign: true 
    }
  });
  
  if (!transactionLog) {
    console.error(`Transaction log not found: ${transactionLogId}`);
    return;
  }
  
  // Map CryptoProcessing status to our internal status
  let status: string;
  switch (paymentStatus.toLowerCase()) {
    case 'completed':
    case 'confirmed':
    case 'success':
      status = 'completed';
      break;
    case 'pending':
    case 'processing':
    case 'unconfirmed':
      status = 'processing';
      break;
    case 'failed':
    case 'error':
    case 'expired':
      status = 'failed';
      break;
    default:
      status = 'unknown';
  }
  
  // Update transaction log with the new status and details
  await prisma.transactionLog.update({
    where: { id: transactionLogId },
    data: {
      status,
      apiResponse: JSON.stringify(payload)
    }
  });
  
  // If the payment failed, revert campaign amount
  if (status === 'failed' && transactionLog.contribution && transactionLog.campaign) {
    await prisma.campaign.update({
      where: { id: transactionLog.campaign.id },
      data: {
        currentAmount: { decrement: transactionLog.contribution.amount },
        goalReached: false // Recalculate goal status
      }
    });
    
    // Mark contribution as failed
    if (transactionLog.contribution) {
      await prisma.contribution.update({
        where: { id: transactionLog.contribution.id },
        data: { status: 'failed' }
      });
    }
  }
  
  // If the payment is completed, ensure the transaction hash is recorded
  if (status === 'completed' && transactionLog.contribution && transactionHash) {
    await prisma.contribution.update({
      where: { id: transactionLog.contribution.id },
      data: { 
        transactionHash,
        status: 'completed'
      }
    });
    
    // Verify the campaign goal status after successful payment
    if (transactionLog.campaign) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: transactionLog.campaign.id }
      });
      
      if (campaign && !campaign.goalReached && campaign.currentAmount >= campaign.fundingGoal) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { goalReached: true }
        });
      }
    }
  }
}

/**
 * Handle a campaign creation fee payment webhook
 */
async function handleCampaignFeePayment(payload: CryptoPaymentWebhookPayload) {
  // Get details from the payload
  const paymentId = payload.id || '';
  const paymentStatus = payload.status || '';
  
  // Find the transaction log for this payment
  const transactionLog = await prisma.transactionLog.findFirst({
    where: {
      type: 'campaign_fee',
      apiResponse: {
        contains: paymentId
      }
    }
  });
  
  if (!transactionLog) {
    console.error(`Campaign fee transaction log not found for payment: ${paymentId}`);
    return;
  }
  
  // Map CryptoProcessing status to our internal status
  let status: string;
  switch (paymentStatus.toLowerCase()) {
    case 'completed':
    case 'confirmed':
    case 'success':
      status = 'completed';
      break;
    case 'pending':
    case 'processing':
    case 'unconfirmed':
      status = 'processing';
      break;
    case 'failed':
    case 'error':
    case 'expired':
      status = 'failed';
      break;
    default:
      status = 'unknown';
  }
  
  // Update transaction log with the new status
  await prisma.transactionLog.update({
    where: { id: transactionLog.id },
    data: {
      status,
      apiResponse: JSON.stringify(payload)
    }
  });
  
  // If this is a completed payment and there's a pending campaign, activate it
  if (status === 'completed') {
    // Find a pending campaign associated with this transaction
    // This assumes there's a relation between transaction logs and campaigns
    // which might need to be added to the schema
    const pendingCampaign = await prisma.campaign.findFirst({
      where: {
        active: false,
        // Add any other conditions to find the right campaign
        // e.g., createdAt within a reasonable timeframe of the transaction
        createdAt: {
          gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (pendingCampaign) {
      await prisma.campaign.update({
        where: { id: pendingCampaign.id },
        data: { active: true }
      });
    }
  }
} 