import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../../../lib/auth';

// GET all campaigns
export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST a new campaign
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a campaign' },
        { status: 401 }
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
      walletAddress
    } = body;

    // Validate required fields
    if (!title || !description || !targetAmount || !deadline || !category || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        targetAmount: parseFloat(targetAmount),
        deadline: new Date(deadline),
        category,
        image,
        walletAddress,
        userId: session.user.id,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
} 