import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET all campaigns
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const title = searchParams.get('title');
    
    let whereClause: any = { active: true };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (title) {
      whereClause.title = {
        contains: title,
        mode: 'insensitive',
      };
    }
    
    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
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
      shortDescription,
      fundingGoal, 
      deadline, 
      category, 
      mainImage,
      additionalMedia = [],
      website = '',
      socials = [],
      walletAddress,
      cryptocurrencyType
    } = body;

    // Validate required fields
    if (!title || !description || !fundingGoal || !deadline || !category || !walletAddress || !cryptocurrencyType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        title,
        shortDescription: shortDescription || description.substring(0, 150) + (description.length > 150 ? '...' : ''),
        description,
        fundingGoal: parseFloat(fundingGoal),
        deadline: new Date(deadline),
        category,
        mainImage,
        website,
        walletAddress,
        cryptocurrencyType,
        userId: session.user.id,
      },
    });

    // Create associated media records
    if (additionalMedia && additionalMedia.length > 0) {
      const mediaRecords = additionalMedia.map((media: { url: string, type: string }) => ({
        url: media.url,
        type: media.type,
        campaignId: campaign.id
      }));
      
      await prisma.media.createMany({
        data: mediaRecords
      });
    }
    
    // Create associated social links
    if (socials && socials.length > 0) {
      const socialRecords = socials.map((social: { platform: string, url: string }) => ({
        platform: social.platform,
        url: social.url,
        campaignId: campaign.id
      }));
      
      await prisma.social.createMany({
        data: socialRecords
      });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
} 