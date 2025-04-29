'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  walletAddress: string;
  paymentId?: string;
  apiResponse?: Record<string, unknown>;
}

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
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

        const data = await response.json();
        setPaymentDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-green-700">Payment Successful!</h2>
        <p className="mb-4">Thank you for your payment. Your transaction has been processed successfully.</p>
        
        {paymentDetails && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 text-left">
            <h3 className="font-medium mb-2">Payment Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Amount:</div>
              <div>{paymentDetails.amount} {paymentDetails.currency}</div>
              
              <div className="text-gray-600">Status:</div>
              <div className="capitalize">{paymentDetails.status}</div>
              
              <div className="text-gray-600">Date:</div>
              <div>{new Date(paymentDetails.createdAt).toLocaleString()}</div>
              
              {paymentDetails.status === 'converted' && (
                <>
                  <div className="text-gray-600">Converted to SOL:</div>
                  <div>Yes</div>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="space-x-4">
          <Link 
            href="/test-payment"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Make Another Payment
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