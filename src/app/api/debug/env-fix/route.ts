import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Set runtime for Node.js environment
export const runtime = 'nodejs';

export async function GET() {
  // Check for a secret token to prevent public access
  const headersList = headers();
  const authorization = headersList.get('authorization') || '';
  const authToken = process.env.DEBUG_AUTH_TOKEN;
  
  if (!authorization || authorization !== `Bearer ${authToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get database configuration info
    const dbConfig = {
      databaseUrl: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.split('://')[0]}://${process.env.DATABASE_URL.includes('@') 
          ? process.env.DATABASE_URL.split('@')[0].split(':')[0] + ':***@' + process.env.DATABASE_URL.split('@')[1].slice(0, 15) + '...'
          : '***'}`
        : 'Not set',
      isAccelerate: process.env.DATABASE_URL?.startsWith('prisma+'),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      directUrlPrefix: process.env.DIRECT_URL 
        ? process.env.DIRECT_URL.split('://')[0] + '://'
        : 'Not set',
    };
    
    // Check if we have the right configuration
    const configStatus = {
      isValid: Boolean(process.env.DATABASE_URL),
      needsDirectUrl: dbConfig.isAccelerate && !dbConfig.hasDirectUrl,
      accelerateConfigured: dbConfig.isAccelerate && dbConfig.hasDirectUrl,
      standardPostgres: !dbConfig.isAccelerate && Boolean(process.env.DATABASE_URL),
    };
    
    // Get instructions for fixing
    const instructions = configStatus.isValid
      ? configStatus.needsDirectUrl
        ? "You're using Prisma Accelerate but missing DIRECT_URL. Add a DIRECT_URL environment variable with your direct PostgreSQL connection string."
        : configStatus.accelerateConfigured
          ? "Your Prisma Accelerate configuration looks good with both DATABASE_URL and DIRECT_URL set."
          : "You're using a standard PostgreSQL connection."
      : "DATABASE_URL is not set. Please configure your database connection.";
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      dbConfig,
      configStatus,
      instructions,
      prismaSchema: {
        needsUpdate: dbConfig.isAccelerate && !process.env.PRISMA_SCHEMA_ACCELERATE,
        requiredChanges: dbConfig.isAccelerate 
          ? "Add 'accelerate' to previewFeatures and add directUrl to datasource"
          : "No changes needed",
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in environment debug endpoint:', err);
    return NextResponse.json(
      { 
        error: 'Failed to get environment configuration',
        message: err.message,
      },
      { status: 500 }
    );
  }
} 