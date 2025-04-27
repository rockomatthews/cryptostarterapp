import { NextResponse } from "next/server";

// Set Node.js runtime
export const runtime = 'nodejs';

// Improved build vs runtime detection
const isBuildTime = typeof window === 'undefined' && 
                   (process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.VERCEL_ENV === 'development');

// Custom helper to get Prisma client
async function getPrismaClient() {
  if (isBuildTime) {
    console.log('API route: Build time detected, using mock data');
    return null;
  }
  
  try {
    console.log('API route: Runtime detected, loading Prisma');
    // Using a separate dynamic import to avoid build time issues
    const { PrismaClient } = await import('@prisma/client');
    // Initialize a new client for this request
    const prisma = new PrismaClient();
    return prisma;
  } catch (error) {
    console.error('API route: Failed to load Prisma:', error);
    return null;
  }
}

/**
 * Simplified API route for production build
 * This is a temporary solution to bypass Prisma initialization issues during build
 */

// GET user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // During build time, return mock data
    if (isBuildTime) {
      return NextResponse.json({ 
        id: id,
        name: "Mock User",
        email: "user@example.com",
        bio: "This is mock data for build time",
        image: null
      });
    }
    
    // Load Prisma client at runtime
    const prisma = await getPrismaClient();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    // Disconnect prisma after use
    await prisma.$disconnect();
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in user endpoint:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // For build time, return mock data
    if (isBuildTime) {
      console.log('Build time detected, returning mock update response');
      return NextResponse.json({ 
        id: id,
        name: data.username || "Mock User",
        email: "user@example.com",
        bio: data.bio || "This is mock data for build time",
        image: data.image || null,
        updated: true
      });
    }
    
    // Extract updatable fields
    const { username, bio, image } = data;
    
    // Load Prisma client at runtime
    const prisma = await getPrismaClient();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
    
    console.log('Updating user:', id, { name: username, bio, image });
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: username,
        bio,
        image
      }
    });
    
    // Disconnect prisma after use
    await prisma.$disconnect();
    
    console.log('User updated successfully:', updatedUser);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error in user update endpoint:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
} 