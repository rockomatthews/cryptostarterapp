'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { solanaConfig } from '@/lib/web3Config';
import { testCampaignFee, SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

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

// Group cryptocurrencies by their wallet type
const SOLANA_BASED = ['SOL'];

function TestPaymentContent() {
  const { data: session } = useSession();
  const { publicKey: solAddress, connect: connectSolanaWallet } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);

  const handleConnectWallet = async () => {
    try {
      if (SOLANA_BASED.includes(selectedCurrency)) {
        // Connect Solana wallet
        await connectSolanaWallet();
        if (solAddress) {
          setWalletAddress(solAddress.toString());
          setIsWalletConnected(true);
        }
      } else {
        // For all other currencies, use CryptoProcessing's built-in wallet
        // In a real implementation, this would integrate with CryptoProcessing's API
        // For now, we'll use a simple input
        const address = prompt(`Please enter your ${selectedCurrency} address:`);
        if (address) {
          setWalletAddress(address);
          setIsWalletConnected(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const handleTestPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!walletAddress) {
        throw new Error(`Please connect your ${selectedCurrency} wallet first`);
      }

      const response = await testCampaignFee({
        currency: selectedCurrency,
        walletAddress
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
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
                onClick={() => {
                  setSelectedCurrency('');
                  handleDisconnectWallet();
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Change
              </button>
            </div>

            {!isWalletConnected ? (
              <button
                onClick={handleConnectWallet}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
              >
                Connect {selectedCurrency} Wallet
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                  <p className="font-medium">Wallet Connected!</p>
                  <p className="text-sm">
                    Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>

                <button
                  onClick={handleTestPayment}
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Submit Payment'}
                </button>
              </div>
            )}

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

export default function TestPaymentPage() {
  const queryClient = new QueryClient();
  
  // Define Solana wallets
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