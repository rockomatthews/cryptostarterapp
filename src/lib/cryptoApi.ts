/**
 * Utility functions for interacting with the cryptoprocessing.io API
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://api.cryptoprocessing.io/v1';
const API_KEY = process.env.CRYPTO_PROCESSING_API_KEY || '';
const STORE_ID = process.env.CRYPTO_PROCESSING_STORE_ID || '';

// Create axios instance for API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    'X-Store-ID': STORE_ID
  },
  withCredentials: false
});

// Supported cryptocurrencies
export const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin', icon: '/icons/btc.svg' },
  { value: 'ETH', label: 'Ethereum', icon: '/icons/eth.svg' },
  { value: 'SOL', label: 'Solana', icon: '/icons/sol.svg' },
  { value: 'USDT', label: 'Tether', icon: '/icons/usdt.svg' },
  { value: 'BNB', label: 'Binance Coin', icon: '/icons/bnb.svg' },
  { value: 'XRP', label: 'Ripple', icon: '/icons/xrp.svg' },
  { value: 'ADA', label: 'Cardano', icon: '/icons/ada.svg' },
  { value: 'AVAX', label: 'Avalanche', icon: '/icons/avax.svg' },
  { value: 'DOT', label: 'Polkadot', icon: '/icons/dot.svg' },
  { value: 'DOGE', label: 'Dogecoin', icon: '/icons/doge.svg' },
  { value: 'MATIC', label: 'Polygon', icon: '/icons/matic.svg' },
  { value: 'LINK', label: 'Chainlink', icon: '/icons/link.svg' },
  { value: 'UNI', label: 'Uniswap', icon: '/icons/uni.svg' },
  { value: 'ATOM', label: 'Cosmos', icon: '/icons/atom.svg' },
  { value: 'LTC', label: 'Litecoin', icon: '/icons/ltc.svg' },
  { value: 'USDC', label: 'USD Coin', icon: '/icons/usdc.svg' }
];

// Campaign creation fee in USDT
export const CAMPAIGN_CREATION_FEE = 10;

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  description: string;
}

export async function createPaymentIntent({ amount, currency, description }: CreatePaymentIntentParams) {
  try {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
} 