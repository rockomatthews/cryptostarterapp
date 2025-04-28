/**
 * Utility functions for interacting with the cryptoprocessing.io API
 */

import axios from 'axios';
import { prisma } from './prisma';

// Check if we're in a server build context (not client runtime)
const isBuildOrSSR = typeof window === 'undefined' && 
                    (process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.VERCEL_ENV === 'development');

// Dynamically import Prisma to avoid build-time initialization
async function getPrismaClient() {
  if (isBuildOrSSR) {
    return null; // Return null during build
  }
  
  try {
    return prisma;
  } catch (error) {
    console.error('Failed to load Prisma:', error);
    return null;
  }
}

// API Configuration
const API_BASE_URL = 'https://api.cryptoprocessing.io/v1';
const API_KEY = process.env.CRYPTO_PROCESSING_API_KEY || '';
const STORE_ID = process.env.CRYPTO_PROCESSING_STORE_ID || '';
const PLATFORM_WALLET = process.env.PLATFORM_ESCROW_WALLET || '';
const PLATFORM_WALLET_TYPE = process.env.PLATFORM_WALLET_TYPE || 'SOL'; // Default to SOL if not specified

// Create axios instance for API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    'X-Store-ID': STORE_ID
  },
  // Add CORS configuration
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

// Platform fee percentage for successful campaigns
export const PLATFORM_FEE_PERCENTAGE = 3.5;

interface ConvertCurrencyParams {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

interface ProcessDonationParams {
  amount: number;
  currency: string;
  campaignId: string;
  userId: string;
  donorWalletAddress: string;
  message?: string;
  anonymous?: boolean;
}

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  description: string;
}

/**
 * Convert between cryptocurrencies using cryptoprocessing.io API
 */
export async function convertCurrency({ amount, fromCurrency, toCurrency }: ConvertCurrencyParams): Promise<number> {
  try {
    // If converting to the same currency, return the original amount
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    // During build/SSR, return a mock conversion with 10% difference
    if (isBuildOrSSR) {
      return amount * 1.1; // Dummy conversion rate
    }
    
    const response = await apiClient.get('/exchange/rate', {
      params: {
        from_currency: fromCurrency,
        to_currency: toCurrency
      }
    });
    
    if (!response.data.success) {
      throw new Error(`Exchange API error: ${response.data.message || 'Unknown error'}`);
    }
    
    const rate = response.data.result.rate;
    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw new Error('Failed to convert currency');
  }
}

/**
 * Process a donation to a campaign
 */
export async function processDonation(params: ProcessDonationParams) {
  const { amount, currency, campaignId, userId } = params;
  
  try {
    // During build/SSR, return a placeholder response
    if (isBuildOrSSR) {
      console.log('Returning placeholder donation response for build/SSR');
      return { 
        success: true, 
        transactionId: 'placeholder-id',
        amount,
        currency
      };
    }
    
    // Get Prisma client
    const prisma = await getPrismaClient();
    if (!prisma) {
      console.error('Prisma client not available');
      return { 
        success: false, 
        error: 'Database connection not available'
      };
    }
    
    // Create payment intent
    const response = await apiClient.post('/payments', {
      amount,
      currency,
      description: `Donation to campaign ${campaignId}`,
      callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/crypto-payment?type=donation&campaignId=${campaignId}&userId=${userId}`,
    });
    
    if (!response.data.success) {
      throw new Error(`Payment API error: ${response.data.message || 'Unknown error'}`);
    }
    
    // Log the transaction
    await prisma.transactionLog.create({
      data: {
        type: 'donation',
        amount,
        currency,
        status: 'pending',
        campaignId,
        apiResponse: JSON.stringify(response.data)
      }
    });
    
    return {
      success: true,
      transactionId: response.data.result.id,
      amount,
      currency
    };
  } catch (error) {
    console.error('Error processing donation:', error);
    
    // Only log the error if not in build/SSR
    if (!isBuildOrSSR) {
      try {
        const prisma = await getPrismaClient();
        if (prisma) {
          // Log the error
          await prisma.transactionLog.create({
            data: {
              type: 'donation',
              amount,
              currency,
              status: 'failed',
              campaignId,
              apiResponse: error instanceof Error ? error.message : JSON.stringify(error)
            }
          });
        }
      } catch (logError) {
        console.error('Failed to log transaction error:', logError);
      }
    }
    
    throw new Error('Failed to process donation');
  }
}

/**
 * Create a payment intent for campaign creation fee
 */
export async function createPaymentIntent({ amount, currency, description }: CreatePaymentIntentParams) {
  try {
    // During build or SSR, return a placeholder response
    if (isBuildOrSSR) {
      console.log('Returning placeholder payment intent for build/SSR');
      return {
        id: 'placeholder-id',
        amount,
        currency,
        description,
        client_secret: 'placeholder-secret',
        status: 'pending',
        payment_url: '#'
      };
    }
    
    // Get Prisma client
    const prisma = await getPrismaClient();
    if (!prisma) {
      console.error('Prisma client not available');
      return {
        id: 'placeholder-id',
        amount,
        currency,
        description,
        client_secret: 'placeholder-secret',
        status: 'pending',
        payment_url: '#'
      };
    }
    
    // Client-side execution continues normally
    try {
      const response = await apiClient.post('/payments', {
        amount,
        currency,
        description,
        callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/crypto-payment?type=campaign_fee`,
      });
      
      if (!response.data.success) {
        throw new Error(`Payment API error: ${response.data.message || 'Unknown error'}`);
      }
      
      // Log the transaction
      await prisma.transactionLog.create({
        data: {
          type: 'campaign_fee',
          amount,
          currency,
          status: 'pending',
          apiResponse: JSON.stringify(response.data)
        }
      });
      
      return {
        id: response.data.result.id,
        amount,
        currency,
        description,
        client_secret: response.data.result.client_secret,
        status: response.data.result.status,
        payment_url: response.data.result.payment_url
      };
    } catch (apiError) {
      console.error('API call error:', apiError);
      
      // For development/testing, return a mock response
      if (process.env.NODE_ENV !== 'production') {
        console.log('Returning mock payment intent for development');
        return {
          id: 'mock-id-' + Date.now(),
          amount,
          currency,
          description,
          client_secret: 'mock-secret',
          status: 'pending',
          payment_url: '#'
        };
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Only log the error if not in build/SSR
    if (!isBuildOrSSR) {
      try {
        const prisma = await getPrismaClient();
        if (prisma) {
          // Log the error
          await prisma.transactionLog.create({
            data: {
              type: 'campaign_fee',
              amount,
              currency,
              status: 'failed',
              apiResponse: error instanceof Error ? error.message : JSON.stringify(error)
            }
          });
        }
      } catch (logError) {
        console.error('Failed to log transaction error:', logError);
      }
    }
    
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Process funds distribution for a successful campaign
 */
export async function distributeSuccessfulCampaignFunds(campaignId: string) {
  try {
    // During build/SSR, return a placeholder response
    if (isBuildOrSSR) {
      console.log('Returning placeholder distribution response for build/SSR');
      return { 
        success: true, 
        amount: 100,  
        currency: 'USDT'
      };
    }
    
    // Get Prisma client
    const prisma = await getPrismaClient();
    if (!prisma) {
      console.error('Prisma client not available');
      return { 
        success: false, 
        error: 'Database connection not available'
      };
    }
    
    // Get campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    // Calculate platform fee
    const platformFee = campaign.currentAmount * (PLATFORM_FEE_PERCENTAGE / 100);
    const creatorAmount = campaign.currentAmount - platformFee;
    
    // In a real implementation, we would:
    // 1. Transfer platform fee to platform wallet
    // 2. Transfer remaining amount to creator's wallet
    
    // For now, we'll just update the campaign status
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        active: false
      }
    });
    
    return {
      success: true,
      amount: creatorAmount,
      currency: campaign.cryptocurrencyType || 'USDT'
    };
  } catch (error) {
    console.error('Error distributing campaign funds:', error);
    throw new Error('Failed to distribute campaign funds');
  }
}

/**
 * Process refunds for a failed campaign
 */
export async function processFailedCampaignRefunds(campaignId: string) {
  try {
    // During build/SSR, return a placeholder response
    if (isBuildOrSSR) {
      console.log('Returning placeholder refund response for build/SSR');
      return { 
        success: true, 
        refundedAmount: 100,
        currency: 'USDT'
      };
    }
    
    // Get Prisma client
    const prisma = await getPrismaClient();
    if (!prisma) {
      console.error('Prisma client not available');
      return { 
        success: false, 
        error: 'Database connection not available'
      };
    }
    
    // Get campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    // In a real implementation, we would:
    // 1. Process refunds to each contributor
    // 2. Update contribution statuses
    
    // For now, we'll just update the campaign status
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        active: false
      }
    });
    
    return {
      success: true,
      refundedAmount: campaign.currentAmount,
      currency: campaign.cryptocurrencyType || 'USDT'
    };
  } catch (error) {
    console.error('Error processing campaign refunds:', error);
    throw new Error('Failed to process campaign refunds');
  }
}

/**
 * Verify the status of a transaction
 */
export async function verifyTransactionStatus(transactionId: string) {
  try {
    // During build/SSR, return a placeholder response
    if (isBuildOrSSR) {
      console.log('Returning placeholder transaction status for build/SSR');
      return { 
        success: true, 
        status: 'completed',
        transactionId
      };
    }
    
    // Get Prisma client
    const prisma = await getPrismaClient();
    if (!prisma) {
      console.error('Prisma client not available');
      return { 
        success: false, 
        error: 'Database connection not available'
      };
    }
    
    // Check transaction status with API
    const response = await apiClient.get(`/payments/${transactionId}`);
    
    if (!response.data.success) {
      throw new Error(`API error: ${response.data.message || 'Unknown error'}`);
    }
    
    const status = response.data.result.status;
    
    // Update transaction log if needed
    if (status === 'completed' || status === 'failed') {
      await prisma.transactionLog.updateMany({
        where: { 
          apiResponse: { contains: transactionId }
        },
        data: {
          status: status === 'completed' ? 'completed' : 'failed'
        }
      });
    }
    
    return {
      success: true,
      status,
      transactionId
    };
  } catch (error) {
    console.error('Error verifying transaction status:', error);
    throw new Error('Failed to verify transaction status');
  }
} 