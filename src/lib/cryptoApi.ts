/**
 * Utility functions for interacting with the NOWPayments API
 */

// Supported cryptocurrencies
export const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'SOL', label: 'Solana' },
  { value: 'USDT', label: 'Tether' },
  { value: 'BNB', label: 'Binance Coin' },
  { value: 'XRP', label: 'Ripple' },
  { value: 'ADA', label: 'Cardano' },
  { value: 'AVAX', label: 'Avalanche' },
  { value: 'DOT', label: 'Polkadot' },
  { value: 'DOGE', label: 'Dogecoin' },
  { value: 'MATIC', label: 'Polygon' },
  { value: 'LINK', label: 'Chainlink' },
  { value: 'UNI', label: 'Uniswap' },
  { value: 'ATOM', label: 'Cosmos' },
  { value: 'LTC', label: 'Litecoin' },
  { value: 'USDC', label: 'USD Coin' }
];

// Campaign creation fee in USDT
export const CAMPAIGN_CREATION_FEE = 10;

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  description: string;
}

interface ConvertCurrencyParams {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

interface TestCampaignFeeParams {
  currency: string;
}

export async function convertCurrency({ amount, fromCurrency, toCurrency }: ConvertCurrencyParams) {
  try {
    const response = await fetch('/api/payments/convert-currency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        fromCurrency,
        toCurrency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to convert currency');
    }

    return await response.json();
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
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

export async function testCampaignFee({ currency }: TestCampaignFeeParams) {
  try {
    const response = await fetch('/api/payments/test-campaign-fee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        currency,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create test payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error testing campaign fee:', error);
    throw error;
  }
} 