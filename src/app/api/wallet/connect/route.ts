import { NextResponse } from 'next/server';
import { connectWallet } from '@/lib/cryptoProcessingApi';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers
        }
      );
    }

    const { network } = await request.json();

    if (!network) {
      return NextResponse.json(
        { error: 'Network is required' },
        { 
          status: 400,
          headers
        }
      );
    }

    const connection = await connectWallet(network);

    return NextResponse.json(connection, { headers });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    );
  }
} 