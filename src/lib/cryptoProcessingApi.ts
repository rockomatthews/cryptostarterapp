import { prisma } from '@/lib/prisma';

const CRYPTO_PROCESSING_API_URL = 'https://api.cryptoprocessing.io/v1';
const PLATFORM_SOL_WALLET = process.env.PLATFORM_SOL_WALLET || '';

interface CreatePaymentParams {
  amount: number;
  currency: string;
  walletAddress: string;
  description: string;
}

interface ConvertToSolParams {
  amount: number;
  fromCurrency: string;
}

export async function createPayment({ amount, currency, walletAddress, description }: CreatePaymentParams) {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRYPTO_PROCESSING_API_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        wallet_address: walletAddress,
        description,
        store_id: process.env.CRYPTO_PROCESSING_STORE_ID,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

export async function convertToSol({ amount, fromCurrency }: ConvertToSolParams) {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API_URL}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRYPTO_PROCESSING_API_KEY}`,
      },
      body: JSON.stringify({
        amount,
        from_currency: fromCurrency,
        to_currency: 'SOL',
        wallet_address: PLATFORM_SOL_WALLET,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to convert currency');
    }

    return await response.json();
  } catch (error) {
    console.error('Error converting to SOL:', error);
    throw error;
  }
}

export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API_URL}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CRYPTO_PROCESSING_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
}

export async function transferToSolWallet(paymentId: string) {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRYPTO_PROCESSING_API_KEY}`,
      },
      body: JSON.stringify({
        payment_id: paymentId,
        to_wallet: PLATFORM_SOL_WALLET,
        to_currency: 'SOL',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to transfer to SOL wallet');
    }

    return await response.json();
  } catch (error) {
    console.error('Error transferring to SOL wallet:', error);
    throw error;
  }
} 