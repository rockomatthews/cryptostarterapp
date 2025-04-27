/**
 * Utility functions for interacting with the cryptoprocessing.io API
 */

import axios from 'axios';
import type { PrismaClient, Prisma } from '@prisma/client';

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
    const { default: prisma } = await import('./prisma');
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
  }
});

// Supported cryptocurrencies
export const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin', icon: '/icons/btc.svg' },
  { value: 'ETH', label: 'Ethereum', icon: '/icons/eth.svg' },
  { value: 'SOL', label: 'Solana', icon: '/icons/sol.svg' },
  { value: 'ADA', label: 'Cardano', icon: '/icons/ada.svg' },
  { value: 'DOT', label: 'Polkadot', icon: '/icons/dot.svg' },
  { value: 'USDT', label: 'Tether', icon: '/icons/usdt.svg' },
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
        to_currency: toCurrency,
        amount: amount
      }
    });
    
    if (response.data.success) {
      return response.data.result.converted_amount;
    } else {
      throw new Error(`API error: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error converting currency:', error);
    
    // Skip database operations during build
    if (!isBuildOrSSR) {
      // Log the error to transaction log
      await prisma.transactionLog.create({
        data: {
          type: 'conversion',
          amount,
          currency: fromCurrency,
          status: 'failed',
          apiResponse: error instanceof Error ? error.message : JSON.stringify(error)
        }
      });
    }
    
    throw new Error('Failed to convert currency');
  }
}

/**
 * Process donation to a campaign
 */
export async function processDonation(params: ProcessDonationParams) {
  const { amount, currency, campaignId, userId, donorWalletAddress, message, anonymous } = params;
  
  try {
    // During build/SSR, return a placeholder response
    if (isBuildOrSSR) {
      console.log('Returning placeholder donation response for build/SSR');
      return { 
        success: true,
        contribution: {
          id: 'placeholder-id',
          amount,
          originalAmount: amount,
          donationCurrency: currency,
          donorWalletAddress,
          transactionHash: 'placeholder-hash',
          message,
          anonymous: anonymous || false,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      };
    }
    
    // Begin transaction to ensure all database operations succeed or fail together
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get campaign details
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId }
      });
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // 2. Create a transaction log entry for tracking
      const transactionLog = await tx.transactionLog.create({
        data: {
          type: 'donation',
          amount,
          currency,
          status: 'pending',
          campaignId
        }
      });
      
      // 3. Create payment intent with cryptoprocessing.io
      const paymentResponse = await apiClient.post('/payments', {
        amount,
        currency,
        description: `Donation to campaign: ${campaign.title}`,
        callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/crypto-payment?transactionId=${transactionLog.id}`,
        payer_wallet: donorWalletAddress,
        receiver_wallet: PLATFORM_WALLET, // Platform's escrow wallet
        wallet_type: PLATFORM_WALLET_TYPE // Specify the wallet type (SOL)
      });
      
      if (!paymentResponse.data.success) {
        throw new Error(`Payment API error: ${paymentResponse.data.message || 'Unknown error'}`);
      }
      
      // 4. Convert donated amount to USDT for escrow
      const usdtAmount = await convertCurrency({
        amount,
        fromCurrency: currency,
        toCurrency: 'USDT'
      });
      
      // 5. Create the contribution record
      const contribution = await tx.contribution.create({
        data: {
          amount: usdtAmount,
          originalAmount: amount,
          donationCurrency: currency,
          donorWalletAddress,
          transactionHash: paymentResponse.data.result.transaction_id,
          message,
          anonymous: anonymous || false,
          userId,
          campaignId
        }
      });
      
      // 6. Update transaction log with contribution ID
      await tx.transactionLog.update({
        where: { id: transactionLog.id },
        data: {
          contributionId: contribution.id,
          status: 'processing',
          apiResponse: JSON.stringify(paymentResponse.data)
        }
      });
      
      // 7. Update campaign amount
      // Note: In a real integration, this would happen after webhook confirmation
      // For now, we're optimistically updating the amount
      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          currentAmount: { increment: usdtAmount },
          goalReached: campaign.fundingGoal <= (campaign.currentAmount + usdtAmount)
        }
      });
      
      return { 
        success: true, 
        contribution,
        paymentIntent: paymentResponse.data.result
      };
    });
    
  } catch (error) {
    console.error('Error processing donation:', error);
    
    // Skip database operations during build
    if (!isBuildOrSSR) {
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
    
    // Client-side execution continues normally
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
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Only log the error if not in build/SSR
    if (!isBuildOrSSR) {
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
        currency: 'USDT',
        transferId: 'placeholder-transfer-id'
      };
    }
    
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get campaign details
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId }
      });
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      if (campaign.fundsDistributed) {
        throw new Error('Funds already distributed');
      }
      
      if (!campaign.goalReached) {
        throw new Error('Cannot distribute funds for campaign that did not reach its goal');
      }
      
      // 2. Calculate platform fee
      const platformFee = campaign.currentAmount * (PLATFORM_FEE_PERCENTAGE / 100);
      const creatorAmount = campaign.currentAmount - platformFee;
      
      // 3. Create a transaction log entry for tracking
      const transactionLog = await tx.transactionLog.create({
        data: {
          type: 'distribution',
          amount: creatorAmount,
          currency: 'USDT',
          status: 'pending',
          campaignId
        }
      });
      
      // 4. Convert funds to requested cryptocurrency
      const convertedAmount = await convertCurrency({
        amount: creatorAmount,
        fromCurrency: 'USDT', // Funds are held in USDT
        toCurrency: campaign.cryptocurrencyType
      });
      
      // 5. Initiate transfer to creator wallet
      const transferResponse = await apiClient.post('/transfers', {
        amount: convertedAmount,
        currency: campaign.cryptocurrencyType,
        description: `Campaign payout: ${campaign.title}`,
        source_wallet: PLATFORM_WALLET,
        destination_wallet: campaign.walletAddress,
        callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/crypto-transfer?transactionId=${transactionLog.id}&type=distribution`,
      });
      
      if (!transferResponse.data.success) {
        throw new Error(`Transfer API error: ${transferResponse.data.message || 'Unknown error'}`);
      }
      
      // 6. Update transaction log
      await tx.transactionLog.update({
        where: { id: transactionLog.id },
        data: {
          status: 'processing',
          apiResponse: JSON.stringify(transferResponse.data)
        }
      });
      
      // 7. Update campaign as distribution in progress
      // Full completion will be handled by the webhook
      await tx.campaign.update({
        where: { id: campaignId },
        data: { 
          fundsDistributed: true 
        }
      });
      
      return { 
        success: true, 
        amount: convertedAmount, 
        currency: campaign.cryptocurrencyType,
        transferId: transferResponse.data.result.id
      };
    });
  } catch (error) {
    console.error('Error distributing campaign funds:', error);
    
    // Skip database operations during build
    if (!isBuildOrSSR) {
      // Log the error
      await prisma.transactionLog.create({
        data: {
          type: 'distribution',
          amount: 0,
          currency: 'UNKNOWN',
          status: 'failed',
          campaignId,
          apiResponse: error instanceof Error ? error.message : JSON.stringify(error)
        }
      });
    }
    
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
      return { success: true, refundCount: 0 };
    }
    
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get campaign details
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId }
      });
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      if (campaign.fundsDistributed) {
        throw new Error('Funds already distributed');
      }
      
      if (campaign.goalReached) {
        throw new Error('Cannot refund a successful campaign');
      }
      
      // 2. Get all contributions for this campaign
      const contributions = await tx.contribution.findMany({
        where: { 
          campaignId,
          refunded: false
        }
      });
      
      // 3. Process refunds for each contribution
      for (const contribution of contributions) {
        // Create a transaction log entry
        const transactionLog = await tx.transactionLog.create({
          data: {
            type: 'refund',
            amount: contribution.amount,
            currency: 'USDT',
            status: 'pending',
            contributionId: contribution.id,
            campaignId
          }
        });
        
        // Convert from USDT back to original currency
        const refundAmount = await convertCurrency({
          amount: contribution.amount,
          fromCurrency: 'USDT',
          toCurrency: contribution.donationCurrency
        });
        
        // Initiate refund transfer
        const refundResponse = await apiClient.post('/transfers', {
          amount: refundAmount,
          currency: contribution.donationCurrency,
          description: `Refund for failed campaign: ${campaign.title}`,
          source_wallet: PLATFORM_WALLET,
          destination_wallet: contribution.donorWalletAddress,
          callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/crypto-transfer?transactionId=${transactionLog.id}&type=refund&contributionId=${contribution.id}`,
        });
        
        if (!refundResponse.data.success) {
          throw new Error(`Refund API error: ${refundResponse.data.message || 'Unknown error'}`);
        }
        
        // Update transaction log
        await tx.transactionLog.update({
          where: { id: transactionLog.id },
          data: {
            status: 'processing',
            apiResponse: JSON.stringify(refundResponse.data)
          }
        });
        
        // Mark contribution as refund in progress
        // Final status will be updated by webhook
        await tx.contribution.update({
          where: { id: contribution.id },
          data: { refunded: true }
        });
      }
      
      // 4. Update campaign
      await tx.campaign.update({
        where: { id: campaignId },
        data: { 
          active: false
        }
      });
      
      return { success: true, refundCount: contributions.length };
    });
  } catch (error) {
    console.error('Error processing campaign refunds:', error);
    
    // Skip database operations during build
    if (!isBuildOrSSR) {
      // Log the error
      await prisma.transactionLog.create({
        data: {
          type: 'refund',
          amount: 0,
          currency: 'UNKNOWN',
          status: 'failed',
          campaignId,
          apiResponse: error instanceof Error ? error.message : JSON.stringify(error)
        }
      });
    }
    
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
        details: { id: transactionId }
      };
    }
    
    const response = await apiClient.get(`/transactions/${transactionId}`);
    
    if (!response.data.success) {
      throw new Error(`API error: ${response.data.message || 'Unknown error'}`);
    }
    
    return {
      success: true,
      status: response.data.result.status,
      details: response.data.result
    };
  } catch (error) {
    console.error('Error verifying transaction status:', error);
    throw new Error('Failed to verify transaction status');
  }
} 