import { NextResponse } from 'next/server';

// Set Node.js runtime
export const runtime = 'nodejs';

/**
 * Simplified API route for production build
 * This is a temporary solution to bypass Prisma initialization issues during build
 */

// GET all contributions
export async function GET() {
  try {
    // Return mock data for build
    return NextResponse.json({
      message: 'Contributions GET endpoint active',
      success: true
    });
  } catch (error) {
    console.error('Error in contributions endpoint:', error);
    return NextResponse.json(
      { message: 'Error processing request' },
      { status: 500 }
    );
  }
}

// POST a new contribution
export async function POST() {
  try {
    // Return mock data for build
    return NextResponse.json({
      message: 'Contributions POST endpoint active',
      success: true
    });
  } catch (error) {
    console.error('Error in contributions endpoint:', error);
    return NextResponse.json(
      { message: 'Error processing request' },
      { status: 500 }
    );
  }
} 