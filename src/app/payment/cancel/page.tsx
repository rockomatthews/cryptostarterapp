'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        if (!paymentId) {
          setError('Payment ID not found');
          setLoading(false);
          return;
        }

        // Fetch payment details from our API
        const response = await fetch(`/api/payments/${paymentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        // We don't need to do anything with the data, just check if it exists
        await response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-700">Error</h2>
          <p className="mb-4">{error}</p>
          <Link 
            href="/test-payment"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="text-center p-8 bg-yellow-50 rounded-lg">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-yellow-700">Payment Cancelled</h2>
        <p className="mb-4">Your payment was cancelled. No charges have been made to your account.</p>
        
        <div className="space-x-4">
          <Link 
            href="/test-payment"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </Link>
          <Link 
            href="/"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 