'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { testCampaignFee, SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';

interface Cryptocurrency {
  value: string;
  label: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export default function TestPaymentPage() {
  const { data: session } = useSession();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await testCampaignFee({
        currency: selectedCurrency,
        walletAddress: 'test-wallet-address' // This will be replaced by CryptoProcessing API
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <p className="text-gray-600">You need to be signed in to make a test payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Payment</h1>

        {!selectedCurrency ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Currency</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SUPPORTED_CRYPTOCURRENCIES.map((crypto: Cryptocurrency) => (
                <button
                  key={crypto.value}
                  onClick={() => setSelectedCurrency(crypto.value)}
                  className="p-4 border rounded-lg hover:border-blue-500 transition-colors text-center"
                >
                  <span className="font-medium">{crypto.label}</span>
                  <span className="block text-sm text-gray-500">{crypto.value}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Selected: {selectedCurrency}
              </h2>
              <button
                onClick={() => setSelectedCurrency('')}
                className="text-blue-500 hover:text-blue-600"
              >
                Change
              </button>
            </div>

            <button
              onClick={handleTestPayment}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Submit Payment'}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                <h3 className="font-semibold">Payment Successful!</h3>
                <p>Payment Intent ID: {result.paymentIntentId}</p>
                <p>Amount: {result.amount} {result.currency}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 