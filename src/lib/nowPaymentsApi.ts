import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const NOW_PAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const API_KEY = process.env.NOW_PAYMENTS_API_KEY;
const IPN_SECRET_KEY = process.env.NOW_PAYMENTS_IPN_SECRET_KEY;

interface CreatePaymentParams {
  amount: number;
  currency: string;
  description?: string;
  orderId?: string;
  successUrl?: string;
  cancelUrl?: string;
  ipnCallbackUrl?: string;
}

interface EstimatePriceParams {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

export async function getAvailableCurrencies() {
  try {
    const response = await fetch(`${NOW_PAYMENTS_API_URL}/currencies`, {
      headers: {
        'x-api-key': API_KEY!,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get available currencies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting available currencies:', error);
    throw error;
  }
}

export async function getMinimumPaymentAmount(fromCurrency: string, toCurrency: string) {
  try {
    const response = await fetch(
      `${NOW_PAYMENTS_API_URL}/min-amount?currency_from=${fromCurrency}&currency_to=${toCurrency}`,
      {
        headers: {
          'x-api-key': API_KEY!,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get minimum payment amount');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting minimum payment amount:', error);
    throw error;
  }
}

export async function getEstimatedPrice({ amount, fromCurrency, toCurrency }: EstimatePriceParams) {
  try {
    const response = await fetch(
      `${NOW_PAYMENTS_API_URL}/estimate?amount=${amount}&currency_from=${fromCurrency}&currency_to=${toCurrency}`,
      {
        headers: {
          'x-api-key': API_KEY!,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get estimated price');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting estimated price:', error);
    throw error;
  }
}

export async function createPayment({
  amount,
  currency,
  description,
  orderId,
  successUrl,
  cancelUrl,
  ipnCallbackUrl,
}: CreatePaymentParams) {
  try {
    const response = await fetch(`${NOW_PAYMENTS_API_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!,
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: currency,
        order_id: orderId,
        order_description: description,
        ipn_callback_url: ipnCallbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
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

export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await fetch(`${NOW_PAYMENTS_API_URL}/payment/${paymentId}`, {
      headers: {
        'x-api-key': API_KEY!,
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

export function verifyIpnSignature(payload: any, signature: string): boolean {
  const sortObject = (obj: any): any => {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] =
          obj[key] && typeof obj[key] === 'object' ? sortObject(obj[key]) : obj[key];
        return result;
      }, {});
  };

  const hmac = crypto.createHmac('sha512', IPN_SECRET_KEY!);
  hmac.update(JSON.stringify(sortObject(payload)));
  const calculatedSignature = hmac.digest('hex');

  return calculatedSignature === signature;
} 