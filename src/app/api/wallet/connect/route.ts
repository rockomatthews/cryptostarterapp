import { NextResponse } from 'next/server';
import { connectWallet } from '@/lib/cryptoProcessingApi';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { network } = await request.json();

    if (!network) {
      return NextResponse.json(
        { error: 'Network is required' },
        { status: 400 }
      );
    }

    const connection = await connectWallet(network);

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { status: 500 }
    );
  }
} 