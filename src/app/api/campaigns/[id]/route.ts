import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../../../lib/auth';

// GET a specific campaign
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        contributions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PUT to update a campaign
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update a campaign' },
        { status: 401 }
      );
    }

    // Get the campaign to check ownership
    const existingCampaign = await prisma.campaign.findUnique({
      where: {
        id,
      },
      select: {
        userId: true,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the campaign
    if (existingCampaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to update this campaign' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const { 
      title, 
      description, 
      targetAmount, 
      deadline, 
      category, 
      image,
      walletAddress,
      active
    } = body;

    // Update the campaign
    const campaign = await prisma.campaign.update({
      where: {
        id,
      },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(targetAmount && { targetAmount: parseFloat(targetAmount) }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(category && { category }),
        ...(image && { image }),
        ...(walletAddress && { walletAddress }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE a campaign
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete a campaign' },
        { status: 401 }
      );
    }

    // Get the campaign to check ownership
    const existingCampaign = await prisma.campaign.findUnique({
      where: {
        id,
      },
      select: {
        userId: true,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the campaign
    if (existingCampaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this campaign' },
        { status: 403 }
      );
    }

    // Delete the campaign
    await prisma.campaign.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}