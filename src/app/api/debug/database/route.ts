import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check environment variables
    const environment = {
      DATABASE_URL: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.substring(0, 30)}...` 
        : 'Not set',
      DIRECT_URL: process.env.DIRECT_URL 
        ? `${process.env.DIRECT_URL.substring(0, 30)}...` 
        : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
      isVercel: Boolean(process.env.VERCEL)
    };

    // Test database connection
    let connectionResult = { success: false, message: 'Not attempted' };
    let users = [];
    
    try {
      // Try a simple query first
      await prisma.$queryRaw`SELECT 1 as test`;
      
      // If successful, try fetching actual users
      const userCount = await prisma.user.count();
      connectionResult = { 
        success: true, 
        message: `Database connection successful! Found ${userCount} users.` 
      };
      
      // Get a few users for testing
      if (userCount > 0) {
        users = await prisma.user.findMany({
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true
          }
        });
      }
    } catch (error: any) {
      connectionResult = {
        success: false,
        message: `Database connection failed: ${error.message}`
      };
    }

    return NextResponse.json({
      environment,
      connectionResult,
      users: users.length > 0 ? users : 'No users found',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check database',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 