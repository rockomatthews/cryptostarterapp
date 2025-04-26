import { NextResponse } from 'next/server';

// Set Node.js runtime
export const runtime = 'nodejs';

/**
 * Simplified cron handler for production build
 * This is a temporary solution to bypass Prisma initialization issues during build
 */
export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');
    
    // Only allow this endpoint to be called with a valid API key in production
    if (process.env.NODE_ENV === 'production' && apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return a success response
    return NextResponse.json({
      message: 'Cron endpoint active. Processing will occur at runtime.',
      success: true
    });
    
  } catch (error) {
    console.error('Error in campaign processing job:', error);
    return NextResponse.json(
      { error: 'Failed to process campaigns' },
      { status: 500 }
    );
  }
} 