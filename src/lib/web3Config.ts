import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi/react';
import { mainnet, sepolia } from 'wagmi/chains';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Configure Ethereum chains
const chains = [mainnet, sepolia] as const;

// Create wagmi config for Ethereum
export const config = defaultWagmiConfig({
  chains,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  metadata: {
    name: 'CryptoStarter',
    description: 'CryptoStarter - Decentralized Crowdfunding Platform',
    url: 'https://cryptostarter.app',
    icons: ['https://cryptostarter.app/icon.png']
  }
});

// Create Web3Modal instance for Ethereum
export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3b82f6',
  },
  defaultChain: mainnet,
});

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