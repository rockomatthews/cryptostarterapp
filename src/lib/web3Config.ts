import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi/react';
import { mainnet, sepolia } from 'wagmi/chains';

// Configure chains
const chains = [mainnet, sepolia] as const;

// Create wagmi config
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

// Create Web3Modal instance
export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3b82f6',
  },
  defaultChain: mainnet,
}); 