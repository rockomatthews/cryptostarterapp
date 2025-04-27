import { NextResponse } from "next/server";
import { prisma, getPrismaStatus } from "@/lib/prisma";

// Define runtime for API route
export const runtime = 'nodejs';

// GET user by ID endpoint
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { isInitialized, isBuildTime } = getPrismaStatus();
  
  // Handle build time or initialization failures
  if (isBuildTime || !isInitialized) {
    console.log('[UserAPI] Using mock data due to build time or initialization failure');
    return NextResponse.json({ 
      id: params.id,
      name: "Demo User",
      email: "user@example.com",
      bio: "This is sample data for preview mode",
      image: null
    });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("[UserAPI] Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user data" },
      { status: 500 }
    );
  }
}

// PUT update user endpoint
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { isInitialized, isBuildTime } = getPrismaStatus();
  
  try {
    const data = await request.json();
    const { username, bio, image } = data;
    
    // Handle build time or initialization failures
    if (isBuildTime || !isInitialized) {
      console.log('[UserAPI] Using mock data due to build time or initialization failure');
      return NextResponse.json({ 
        id: params.id,
        name: username || "Demo User",
        email: "user@example.com",
        bio: bio || "This is sample data for preview mode",
        image: image || null,
        updated: true
      });
    }
    
    // Update user with Prisma
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: username,
        bio,
        image
      }
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[UserAPI] Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
} 