'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { SUPPORTED_CRYPTOCURRENCIES, createPayment } from '@/lib/cryptoProcessingApi';

interface Cryptocurrency {
  value: string;
  label: string;
  network: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  amount: number;
  currency: string;
  paymentUrl: string;
  payAddress: string;
}

interface WalletConnection {
  address: string;
  network: string;
  isConnected: boolean;
}

function TestPaymentContent() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletConnection, setWalletConnection] = useState<WalletConnection>({
    address: '',
    network: '',
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get network info for selected currency
      const cryptoInfo = SUPPORTED_CRYPTOCURRENCIES.find(c => c.value === selectedCurrency);
      if (!cryptoInfo) {
        throw new Error('Please select a currency first');
      }

      // Connect wallet through our backend API
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          network: cryptoInfo.network
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect wallet');
      }

      const connection = await response.json();
      
      setWalletConnection({
        address: connection.address,
        network: connection.network,
        isConnected: true
      });

      // Sign in with wallet when connected
      signIn('wallet', {
        walletAddress: connection.address,
        redirect: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!session?.user) {
        throw new Error('Please sign in to continue');
      }

      if (!walletConnection.isConnected || !walletConnection.address) {
        throw new Error('Please connect your wallet to continue');
      }

      const response = await createPayment({
        amount: 10, // Fixed amount for test payments
        currency: selectedCurrency,
        description: 'Test Payment',
        walletAddress: walletConnection.address,
      });

      setResult({
        success: true,
        paymentIntentId: response.paymentId,
        amount: response.amount,
        currency: response.currency,
        paymentUrl: response.paymentUrl,
        payAddress: response.payAddress,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we check your session.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to make a test payment.</p>
          <button
            onClick={() => signIn()}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
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
                  <span className="block text-xs text-gray-400">{crypto.network}</span>
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
                onClick={() => {
                  setSelectedCurrency('');
                  setResult(null);
                  setWalletConnection({
                    address: '',
                    network: '',
                    isConnected: false
                  });
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Change
              </button>
            </div>

            <div className="mb-6">
              {!walletConnection.isConnected ? (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                  <p className="font-medium">Wallet Connected</p>
                  <p className="text-sm mt-1 break-all">{walletConnection.address}</p>
                  <p className="text-xs mt-1">Network: {walletConnection.network}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
              <p className="font-medium">Test Payment Information</p>
              <p className="text-sm mt-1">
                Click the button below to generate a payment address for {selectedCurrency}.
                The payment will be sent to your connected wallet address.
              </p>
            </div>

            <button
              onClick={handleTestPayment}
              disabled={isLoading || !walletConnection.isConnected}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Generating Payment...' : 'Generate Payment Address'}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                <h3 className="font-semibold">Payment Address Generated!</h3>
                <p className="mt-2">Amount: {result.amount} {result.currency}</p>
                <div className="mt-2">
                  <p className="font-medium">Payment Address:</p>
                  <p className="text-sm break-all bg-white p-2 rounded mt-1">{result.payAddress}</p>
                </div>
                <div className="mt-4">
                  <a 
                    href={result.paymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  >
                    Go to Payment Page
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestPaymentPage() {
  return <TestPaymentContent />;
} 