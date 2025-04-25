import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { distributeSuccessfulCampaignFunds, processFailedCampaignRefunds } from '@/lib/cryptoApi';

/**
 * This API route should be scheduled to run periodically (e.g., daily)
 * to check for ended campaigns and process their outcomes
 */
export async function GET(request: Request) {
  try {
    // Only allow this endpoint to be called with a valid API key in production
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');
    
    if (process.env.NODE_ENV === 'production' && apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find all active campaigns with passed deadlines
    const endedCampaigns = await prisma.campaign.findMany({
      where: {
        deadline: {
          lt: new Date()
        },
        active: true,
        fundsDistributed: false
      }
    });
    
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: 0
    };
    
    // Process each campaign
    for (const campaign of endedCampaigns) {
      try {
        if (campaign.goalReached) {
          // If the goal was reached, distribute funds to creator
          await distributeSuccessfulCampaignFunds(campaign.id);
          results.successful++;
        } else {
          // If the goal was not reached, process refunds to all contributors
          await processFailedCampaignRefunds(campaign.id);
          results.failed++;
        }
        results.processed++;
      } catch (error) {
        console.error(`Error processing campaign ${campaign.id}:`, error);
        results.errors++;
      }
    }
    
    return NextResponse.json({
      message: 'Campaign processing completed',
      processedCount: results.processed,
      totalCampaigns: endedCampaigns.length,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors
    });
    
  } catch (error) {
    console.error('Error in campaign processing job:', error);
    return NextResponse.json(
      { error: 'Failed to process campaigns' },
      { status: 500 }
    );
  }
} 