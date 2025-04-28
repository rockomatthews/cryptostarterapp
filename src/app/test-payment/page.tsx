'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { testCampaignFee } from '@/lib/cryptoApi';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';
import Link from 'next/link';

export default function TestPaymentPage() {
  const { data: session, status } = useSession();
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testCampaignFee({ currency: selectedCurrency });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="text-center p-8 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to test payments.</p>
          <Link 
            href="/api/auth/signin"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Test Campaign Fee Payment</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Select Currency:</label>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {SUPPORTED_CRYPTOCURRENCIES.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.label} ({currency.value})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleTestPayment}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Test Payment'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 