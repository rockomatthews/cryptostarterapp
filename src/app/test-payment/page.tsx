'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { testCampaignFee } from '@/lib/cryptoApi';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { config } from '@/lib/web3Config';
import { WagmiConfig } from 'wagmi';

interface PaymentResult {
  paymentIntent: {
    id: string;
  };
  fee: number;
  currency: string;
  paymentUrl?: string;
}

function TestPaymentContent() {
  const { data: session, status } = useSession();
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'connect' | 'process' | 'redirect'>('select');

  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  const handleTestPayment = async () => {
    try {
      if (!address) {
        setError('Wallet address is required. Please connect your wallet first.');
        return;
      }
      
      setLoading(true);
      setError(null);
      const response = await testCampaignFee({ 
        currency: selectedCurrency,
        walletAddress: address 
      });
      setResult(response);
      
      // If payment URL is returned, redirect to it
      if (response.paymentUrl) {
        setStep('redirect');
        // Redirect to the payment URL
        window.location.href = response.paymentUrl;
      } else {
        setStep('process');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await open();
      setStep('process');
    } catch (error) {
      setError('Failed to connect wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      <h1 className="text-2xl font-bold mb-6">Test Payment</h1>
      
      {step === 'select' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {SUPPORTED_CRYPTOCURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setStep('connect')}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Continue to Connect Wallet
          </button>
        </div>
      )}

      {step === 'connect' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Selected Currency: {selectedCurrency}</h3>
            <p className="text-sm text-gray-600">
              Amount: 10 USDT (or equivalent)
            </p>
          </div>
          
          {!isConnected ? (
            <button
              onClick={handleConnectWallet}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded">
                <p className="text-sm text-green-700">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <button
                onClick={handleTestPayment}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Submit Payment'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'process' && result && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-medium text-green-700 mb-2">Payment Intent Created</h3>
            <p className="text-sm">Payment Intent ID: {result.paymentIntent.id}</p>
            <p className="text-sm">Amount: {result.fee} {result.currency}</p>
            <p className="text-sm">Wallet Address: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
          <button
            onClick={() => {
              setStep('select');
              setResult(null);
            }}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start New Payment
          </button>
        </div>
      )}

      {step === 'redirect' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium text-blue-700 mb-2">Redirecting to Payment Page</h3>
            <p className="text-sm">You will be redirected to CryptoProcessing.io to complete your payment.</p>
            <p className="text-sm mt-2">If you are not redirected automatically, <a href={result?.paymentUrl} className="text-blue-600 underline">click here</a>.</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function TestPaymentPage() {
  return (
    <WagmiConfig config={config}>
      <TestPaymentContent />
    </WagmiConfig>
  );
} 