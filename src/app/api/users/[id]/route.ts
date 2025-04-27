import { NextResponse } from "next/server";
import { prisma, getPrismaStatus } from "@/lib/prisma";

// Set runtime for Node.js environment
export const runtime = 'nodejs';

// GET user by ID
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  // Must get params through the context and properly await it
  const params = await context.params;
  
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if Prisma is initialized
    const prismaStatus = getPrismaStatus();
    
    // If Prisma isn't initialized, return mock data for development
    if (!prismaStatus.initialized) {
      console.log("Prisma not initialized, returning mock data");
      return NextResponse.json({
        id: userId,
        name: "Mock User",
        email: "mock@example.com",
        image: "/images/default-avatar.png",
        bio: "This is mock data because Prisma is not initialized.",
        walletAddress: "0x123456789",
      });
    }

    // Query the database for the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Return specialized error instead of 404
      return NextResponse.json({ 
        error: "User not found",
        id: userId,
        name: "",
        email: "",
        image: "/images/default-avatar.png", 
        bio: "",
      }, { status: 200 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  // Must get params through the context and properly await it
  const params = await context.params;
  
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const data = await req.json();

    // Check if Prisma is initialized
    const prismaStatus = getPrismaStatus();
    
    // If Prisma isn't initialized, return mock successful response
    if (!prismaStatus.initialized) {
      console.log("Prisma not initialized, returning mock success");
      return NextResponse.json({
        id: userId,
        ...data,
        updatedAt: new Date().toISOString(),
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      // Return specialized error with status 200 to avoid breaking UI
      return NextResponse.json({ 
        error: "User not found - cannot update non-existent user",
        id: userId,
        ...data,
        updatedAt: new Date().toISOString(),
      }, { status: 200 });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
} 