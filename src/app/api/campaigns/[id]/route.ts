import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET a specific campaign
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
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
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { message: "Error fetching campaign" },
      { status: 500 }
    );
  }
}

// PUT to update a campaign
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    // Fetch the campaign to check ownership
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
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner
    if (existingCampaign.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - You are not the owner of this campaign" },
        { status: 403 }
      );
    }

    // Update the campaign
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id,
      },
      data: {
        title: body.title,
        description: body.description,
        shortDescription: body.description?.substring(0, 150) + (body.description?.length > 150 ? '...' : ''),
        category: body.category,
        fundingGoal: body.fundingGoal,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        mainImage: body.mainImage,
        website: body.website,
        walletAddress: body.walletAddress,
        active: body.active,
        updatedAt: new Date(),
        socials: {
          deleteMany: {},
          create: body.socials?.map((social: { platform: string, url: string }) => ({
            platform: social.platform,
            url: social.url
          })) || []
        },
        additionalMedia: {
          deleteMany: {},
          create: body.additionalMedia?.map((media: { type: string, url: string }) => ({
            type: media.type,
            url: media.url
          })) || []
        }
      },
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { message: "Error updating campaign" },
      { status: 500 }
    );
  }
}

// DELETE a campaign
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const id = params.id;

    // Fetch the campaign to check ownership
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
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner
    if (existingCampaign.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - You are not the owner of this campaign" },
        { status: 403 }
      );
    }

    // Delete the campaign
    await prisma.campaign.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { message: "Error deleting campaign" },
      { status: 500 }
    );
  }
}