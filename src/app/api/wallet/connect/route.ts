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

    // Get session with detailed error logging
    const session = await getServerSession(authOptions);
    console.log('Session in wallet connect:', session);
    
    if (!session?.user?.id) {
      console.error('No valid session found in wallet connect');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in again' },
        { 
          status: 401,
          headers
        }
      );
    }

    const { network } = await request.json();
    console.log('Network in wallet connect:', network);

    if (!network) {
      return NextResponse.json(
        { error: 'Network is required' },
        { 
          status: 400,
          headers
        }
      );
    }

    try {
      const connection = await connectWallet(network);
      console.log('Wallet connection successful:', connection);
      return NextResponse.json(connection, { headers });
    } catch (error) {
      console.error('Error in connectWallet:', error);
      return NextResponse.json(
        { error: 'Failed to connect wallet - Please try again' },
        { 
          status: 500,
          headers
        }
      );
    }
  } catch (error) {
    console.error('Error in wallet connect route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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