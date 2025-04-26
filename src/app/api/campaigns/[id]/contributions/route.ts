import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const leaderboard = searchParams.get('leaderboard') === 'true';
    
    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    // Fetch contributions for this campaign
    const contributions = await prisma.contribution.findMany({
      where: { campaignId },
      orderBy: leaderboard 
        ? { originalAmount: 'desc' } // Sort by largest donations for leaderboard
        : { createdAt: 'desc' },     // Default sort by most recent
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
} 