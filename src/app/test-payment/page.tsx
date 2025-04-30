'use client';

import { useState, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { solanaConfig } from '@/lib/web3Config';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoProcessingApi';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

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

function TestPaymentContent() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  const { publicKey, connected } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!session?.user) {
        throw new Error('Please sign in to continue');
      }

      if (!connected || !publicKey) {
        throw new Error('Please connect your wallet to continue');
      }

      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10, // Fixed amount for test payments
          currency: selectedCurrency,
          description: 'Test Payment',
          walletAddress: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const data = await response.json();
      setResult({
        success: true,
        paymentIntentId: data.id,
        amount: data.amount,
        currency: data.currency,
        paymentUrl: data.paymentUrl,
        payAddress: data.walletAddress,
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

        {!connected && (
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg mb-6">
            <p className="font-medium">Wallet Not Connected</p>
            <p className="text-sm mt-1">
              Please connect your wallet to make a test payment.
            </p>
          </div>
        )}

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
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Change
              </button>
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
              disabled={isLoading || !connected}
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
  const queryClient = new QueryClient();
  
  // Define Solana wallets with proper configuration
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={solanaConfig.endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <TestPaymentContent />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
} 