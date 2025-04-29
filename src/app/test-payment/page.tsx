'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { solanaConfig } from '@/lib/web3Config';
import { testCampaignFee, SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';

interface Cryptocurrency {
  value: string;
  label: string;
  icon: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export default function TestPaymentPage() {
  const { data: session } = useSession();
  const { address: ethAddress } = useAccount();
  const { publicKey: solAddress } = useWallet();
  const { open: openWeb3Modal } = useWeb3Modal();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the appropriate wallet address based on currency
      const walletAddress = selectedCurrency === 'SOL' 
        ? solAddress?.toString() 
        : ethAddress;

      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
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
                  className="p-4 border rounded-lg hover:border-blue-500 transition-colors text-center flex flex-col items-center gap-2"
                >
                  <Image
                    src={crypto.icon}
                    alt={crypto.label}
                    width={24}
                    height={24}
                  />
                  <span>{crypto.label}</span>
                  <span className="text-sm text-gray-500">{crypto.value}</span>
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

            {selectedCurrency === 'ETH' ? (
              <button
                onClick={() => openWeb3Modal()}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
              >
                Connect Ethereum Wallet
              </button>
            ) : (
              <ConnectionProvider endpoint={solanaConfig.endpoint}>
                <WalletProvider wallets={solanaConfig.wallets} autoConnect>
                  <WalletModalProvider>
                    <button
                      onClick={() => {}}
                      className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                    >
                      Connect {selectedCurrency} Wallet
                    </button>
                  </WalletModalProvider>
                </WalletProvider>
              </ConnectionProvider>
            )}

            {((selectedCurrency === 'ETH' && ethAddress) || 
              (selectedCurrency === 'SOL' && solAddress)) && (
              <button
                onClick={handleTestPayment}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Submit Payment'}
              </button>
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