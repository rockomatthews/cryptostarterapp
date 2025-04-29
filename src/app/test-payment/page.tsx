'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { testCampaignFee } from '@/lib/cryptoApi';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';
import Link from 'next/link';
import { useAccount, useConnect } from 'wagmi';
import { Web3Modal } from '@web3modal/react';
import { config, web3ModalConfig } from '@/lib/web3Config';
import { WagmiConfig } from 'wagmi';

interface PaymentResult {
  paymentIntent: {
    id: string;
  };
  fee: number;
  currency: string;
}

export default function TestPaymentPage() {
  const { data: session, status } = useSession();
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'connect' | 'process'>('select');

  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: isConnectLoading } = useConnect();

  const handleTestPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testCampaignFee({ 
        currency: selectedCurrency,
        walletAddress: address 
      });
      setResult(response);
      setStep('process');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (connectors[0]) {
        await connect({ connector: connectors[0] });
        setStep('process');
      }
    } catch {
      setError('Failed to connect wallet');
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
    <WagmiConfig config={config}>
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
                disabled={isConnectLoading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isConnectLoading ? 'Connecting...' : 'Connect Wallet'}
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

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Web3Modal {...web3ModalConfig} />
      </div>
    </WagmiConfig>
  );
} 