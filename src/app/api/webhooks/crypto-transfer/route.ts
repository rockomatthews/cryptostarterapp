import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define interface for webhook payload
interface CryptoTransferWebhookPayload {
  id?: string;
  transaction_id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Webhook handler for CryptoProcessing.io transfer confirmations
 * This endpoint receives callbacks when a crypto transfer status changes
 * (distribution to creators or refunds to contributors)
 */
export async function POST(request: Request) {
  try {
    // Parse the webhook payload
    const payload: CryptoTransferWebhookPayload = await request.json();
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const type = searchParams.get('type');
    const contributionId = searchParams.get('contributionId');
    
    console.log('Received crypto transfer webhook:', { 
      transactionId, 
      type, 
      contributionId,
      payload 
    });
    
    // Validate required parameters
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing transactionId parameter' },
        { status: 400 }
      );
    }
    
    // Find the transaction log
    const transactionLog = await prisma.transactionLog.findUnique({
      where: { id: transactionId }
    });
    
    if (!transactionLog) {
      console.error(`Transaction log not found: ${transactionId}`);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Map CryptoProcessing status to our internal status
    let status: string;
    const paymentStatus = payload.status?.toLowerCase() || '';
    
    switch (paymentStatus) {
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
      where: { id: transactionId },
      data: {
        status,
        apiResponse: JSON.stringify(payload)
      }
    });
    
    // Handle different types of transfers
    if (type === 'distribution') {
      await handleCampaignDistributionUpdate(transactionLog.campaignId, status);
    } else if (type === 'refund' && contributionId) {
      await handleContributionRefundUpdate(contributionId, status);
    }
    
    // Always return success to avoid retries
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing crypto transfer webhook:', error);
    
    // Log the error but still return 200 to prevent retries
    return NextResponse.json({ success: true });
  }
}

/**
 * Update campaign status when distribution is completed or failed
 */
async function handleCampaignDistributionUpdate(campaignId: string | null, status: string) {
  if (!campaignId) return;
  
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });
    
    if (!campaign) {
      console.error(`Campaign not found: ${campaignId}`);
      return;
    }
    
    if (status === 'completed') {
      // Mark campaign as fully completed
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'completed',
          fundsDistributed: true
        }
      });
      
      // Notify campaign creator (would be implemented in a notification system)
      console.log(`Campaign ${campaignId} distribution completed successfully`);
    } else if (status === 'failed') {
      // Mark distribution as failed, may need manual intervention
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          fundsDistributed: false
        }
      });
      
      // Log error for admin attention
      console.error(`Campaign ${campaignId} distribution failed, requires admin intervention`);
    }
  } catch (error) {
    console.error(`Error updating campaign ${campaignId} distribution status:`, error);
  }
}

/**
 * Update contribution status when refund is completed or failed
 */
async function handleContributionRefundUpdate(contributionId: string, status: string) {
  try {
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId }
    });
    
    if (!contribution) {
      console.error(`Contribution not found: ${contributionId}`);
      return;
    }
    
    if (status === 'completed') {
      // Mark contribution as successfully refunded
      await prisma.contribution.update({
        where: { id: contributionId },
        data: {
          refunded: true,
          status: 'refunded'
        }
      });
      
      // Notify contributor about successful refund (would be implemented in a notification system)
      console.log(`Contribution ${contributionId} refunded successfully`);
    } else if (status === 'failed') {
      // Mark refund as failed, may need manual intervention
      await prisma.contribution.update({
        where: { id: contributionId },
        data: {
          refunded: false,
          status: 'refund_failed'
        }
      });
      
      // Log error for admin attention
      console.error(`Contribution ${contributionId} refund failed, requires admin intervention`);
    }
  } catch (error) {
    console.error(`Error updating contribution ${contributionId} refund status:`, error);
  }
} 