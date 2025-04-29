'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { solanaConfig } from '@/lib/web3Config';
import { testCampaignFee, SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/web3Config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
const ETHEREUM_BASED = ['ETH', 'MATIC', 'BNB', 'AVAX', 'UNI', 'LINK'];
const SOLANA_BASED = ['SOL'];
const BITCOIN_BASED = ['BTC', 'LTC'];

function TestPaymentContent() {
  const { data: session } = useSession();
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { publicKey: solAddress } = useWallet();
  const { open: openWeb3Modal } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      if (ETHEREUM_BASED.includes(selectedCurrency)) {
        await openWeb3Modal();
      } else if (SOLANA_BASED.includes(selectedCurrency)) {
        // Solana wallet connection is handled by the WalletModalProvider
        // The connect button will trigger the wallet modal automatically
      } else if (BITCOIN_BASED.includes(selectedCurrency)) {
        // For Bitcoin-based chains, we'll use CryptoProcessing's built-in wallet
        // No need for external wallet connection
      } else {
        // For other chains, we'll use CryptoProcessing's built-in wallet
        // No need for external wallet connection
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const handleTestPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let walletAddress = '';
      
      if (ETHEREUM_BASED.includes(selectedCurrency)) {
        if (!ethAddress) {
          throw new Error('Please connect your Ethereum wallet first');
        }
        walletAddress = ethAddress;
      } else if (SOLANA_BASED.includes(selectedCurrency)) {
        if (!solAddress) {
          throw new Error('Please connect your Solana wallet first');
        }
        walletAddress = solAddress.toString();
      } else {
        // For Bitcoin and other chains, we'll use a placeholder
        // The actual wallet will be handled by CryptoProcessing
        walletAddress = 'crypto-processing-wallet';
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

  const isWalletConnected = () => {
    if (ETHEREUM_BASED.includes(selectedCurrency)) {
      return isEthConnected;
    } else if (SOLANA_BASED.includes(selectedCurrency)) {
      return !!solAddress;
    } else {
      // For Bitcoin and other chains, we consider them "connected" by default
      // as they'll use CryptoProcessing's built-in wallet
      return true;
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
                onClick={() => {
                  setSelectedCurrency('');
                  if (isEthConnected) disconnect();
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Change
              </button>
            </div>

            {!isWalletConnected() ? (
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
                    {ETHEREUM_BASED.includes(selectedCurrency) 
                      ? `Address: ${ethAddress?.slice(0, 6)}...${ethAddress?.slice(-4)}`
                      : SOLANA_BASED.includes(selectedCurrency)
                      ? `Address: ${solAddress?.toString().slice(0, 6)}...${solAddress?.toString().slice(-4)}`
                      : 'Using CryptoProcessing wallet'}
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

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ConnectionProvider endpoint={solanaConfig.endpoint}>
          <WalletProvider wallets={solanaConfig.wallets} autoConnect>
            <WalletModalProvider>
              <TestPaymentContent />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
} 