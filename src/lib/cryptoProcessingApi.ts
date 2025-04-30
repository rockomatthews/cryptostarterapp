import axios from 'axios';
import crypto from 'crypto';

const CRYPTO_APIS_KEY = process.env.CRYPTO_APIS_KEY;
const API_BASE_URL = 'https://rest.cryptoapis.io/v2';

// Supported cryptocurrencies with their networks
export const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin', network: 'bitcoin/mainnet' },
  { value: 'ETH', label: 'Ethereum', network: 'ethereum/mainnet' },
  { value: 'SOL', label: 'Solana', network: 'solana/mainnet' },
  { value: 'MATIC', label: 'Polygon', network: 'polygon/mainnet' },
  { value: 'BNB', label: 'BNB Smart Chain', network: 'binance-smart-chain/mainnet' },
  { value: 'AVAX', label: 'Avalanche', network: 'avalanche/mainnet' },
  { value: 'XRP', label: 'XRP', network: 'xrp/mainnet' },
  { value: 'LTC', label: 'Litecoin', network: 'litecoin/mainnet' },
  { value: 'DOGE', label: 'Dogecoin', network: 'dogecoin/mainnet' }
];

// Campaign creation fee in USDT
export const CAMPAIGN_CREATION_FEE = 10;

interface PaymentParams {
  amount: number;
  currency: string;
  description: string;
  walletAddress: string;
}

interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  payAddress: string;
  amount: number;
  currency: string;
  status: string;
}

const cryptoApisClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': CRYPTO_APIS_KEY
  }
});

/**
 * Get available cryptocurrencies
 */
export async function getAvailableCurrencies() {
  return SUPPORTED_CRYPTOCURRENCIES;
}

/**
 * Get minimum payment amount for a currency
 */
export async function getMinimumPaymentAmount(currency: string) {
  try {
    // Get network info from supported currencies
    const cryptoInfo = SUPPORTED_CRYPTOCURRENCIES.find(c => c.value === currency);
    if (!cryptoInfo) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // Default minimum amounts
    const defaultMinAmounts: { [key: string]: number } = {
      BTC: 0.0001,
      ETH: 0.001,
      SOL: 0.01,
      MATIC: 1,
      BNB: 0.01,
      AVAX: 0.1,
      XRP: 1,
      LTC: 0.01,
      DOGE: 1
    };

    return defaultMinAmounts[currency] || 0.01;
  } catch (error) {
    console.error('Error getting minimum amount:', error);
    // Return default minimum amounts if API call fails
    const defaultAmounts: { [key: string]: number } = {
      BTC: 0.0001,
      ETH: 0.001,
      SOL: 0.01,
      MATIC: 1,
      BNB: 0.01,
      AVAX: 0.1,
      XRP: 1,
      LTC: 0.01,
      DOGE: 1
    };
    return defaultAmounts[currency] || 0.01;
  }
}

/**
 * Get estimated price for a currency pair
 */
export async function getEstimatedPrice(amount: number, fromCurrency: string, toCurrency: string) {
  try {
    const response = await cryptoApisClient.get('/market-data/exchange-rates/by-symbols', {
      params: {
        fromSymbol: fromCurrency,
        toSymbol: toCurrency
      }
    });

    const rate = response.data.data.item.calculatedRate;
    return amount * rate;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    throw error;
  }
}

/**
 * Create a new payment
 */
export async function createPayment(params: PaymentParams): Promise<PaymentResponse> {
  const { amount, currency, description, walletAddress } = params;

  try {
    // Validate minimum amount
    const minAmount = await getMinimumPaymentAmount(currency);
    if (amount < minAmount) {
      throw new Error(`Amount must be at least ${minAmount} ${currency}`);
    }

    // Get network info
    const cryptoInfo = SUPPORTED_CRYPTOCURRENCIES.find(c => c.value === currency);
    if (!cryptoInfo) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // Generate a unique payment ID
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate the wallet address
    const validateResponse = await cryptoApisClient.post(`/blockchain-tools/${cryptoInfo.network}/addresses/validate`, {
      context: 'Payment validation',
      data: {
        item: {
          address: walletAddress
        }
      }
    });

    if (!validateResponse.data.data.item.isValid) {
      throw new Error('Invalid wallet address');
    }

    // Create a new transaction
    const createTxResponse = await cryptoApisClient.post(`/blockchain-data/${cryptoInfo.network}/transactions/prepare`, {
      context: 'Payment creation',
      data: {
        item: {
          amount,
          recipientAddress: walletAddress,
          description
        }
      }
    });

    // Use the transaction data from the response
    return {
      paymentId: createTxResponse.data.data.item.transactionId || paymentId,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/${paymentId}`,
      payAddress: walletAddress,
      amount,
      currency,
      status: createTxResponse.data.data.item.status || 'pending'
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string) {
  try {
    // Get transaction status
    const response = await cryptoApisClient.get(`/blockchain-data/transactions/${paymentId}`);
    
    return {
      paymentId,
      status: response.data.data.item.status,
      amount: response.data.data.item.amount,
      currency: response.data.data.item.currency,
      payAddress: response.data.data.item.recipientAddress,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/${paymentId}`
    };
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string) {
  try {
    // Implement Crypto APIs webhook signature verification
    const hmac = crypto.createHmac('sha256', CRYPTO_APIS_KEY || '');
    const calculatedSignature = hmac.update(payload).digest('hex');
    return calculatedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
} 