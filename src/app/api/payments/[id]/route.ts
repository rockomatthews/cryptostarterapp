import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const paymentId = params.id;

    // Find the payment intent in our database
    const paymentIntent = await prisma.paymentIntent.findFirst({
      where: {
        OR: [
          { id: paymentId },
          { paymentId: paymentId }
        ],
        userId: session.user.id,
      },
    });

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Parse the API response if it exists
    let apiResponse = null;
    if (paymentIntent.apiResponse) {
      try {
        apiResponse = JSON.parse(paymentIntent.apiResponse);
      } catch (error) {
        console.error('Error parsing API response:', error);
      }
    }

    return NextResponse.json({
      ...paymentIntent,
      apiResponse,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
} 