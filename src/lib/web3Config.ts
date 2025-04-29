import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Solana configuration
export const solanaConfig = {
  endpoint: clusterApiUrl('mainnet-beta'),
  wallets: [new PhantomWalletAdapter()],
};

// Export wallet type enum
export enum WalletType {
  ETH = 'ETH',
  SOL = 'SOL'
} 