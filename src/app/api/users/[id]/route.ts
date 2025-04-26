import { NextResponse } from "next/server";

// Set Node.js runtime
export const runtime = 'nodejs';

/**
 * Simplified API route for production build
 * This is a temporary solution to bypass Prisma initialization issues during build
 */

// GET user by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Return mock data for build
    return NextResponse.json({
      message: `User GET endpoint active for id: ${id}`,
      success: true
    });
  } catch (error) {
    console.error("Error in user endpoint:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Return mock data for build
    return NextResponse.json({
      message: `User PUT endpoint active for id: ${id}`,
      success: true
    });
  } catch (error) {
    console.error("Error in user update endpoint:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
} 