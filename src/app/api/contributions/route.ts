import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../../../lib/auth';

// POST a new contribution
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to contribute' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const { 
      campaignId, 
      amount, 
      message,
      anonymous
    } = body;

    // Validate required fields
    if (!campaignId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that the campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Create the contribution
    const contribution = await prisma.contribution.create({
      data: {
        campaignId,
        userId: session.user.id,
        amount: parseFloat(amount),
        message,
        anonymous: Boolean(anonymous),
      },
    });

    // Update the campaign's current amount
    await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        currentAmount: {
          increment: parseFloat(amount),
        },
      },
    });

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
} 