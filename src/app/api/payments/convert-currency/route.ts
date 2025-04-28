import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES = {
  BTC: 0.000015, // 1 USDT = 0.000015 BTC
  ETH: 0.00025,  // 1 USDT = 0.00025 ETH
  SOL: 0.007,    // 1 USDT = 0.007 SOL
  USDT: 1,       // 1 USDT = 1 USDT
  BNB: 0.0035,   // 1 USDT = 0.0035 BNB
  XRP: 1.8,      // 1 USDT = 1.8 XRP
  ADA: 2.5,      // 1 USDT = 2.5 ADA
  AVAX: 0.04,    // 1 USDT = 0.04 AVAX
  DOT: 0.15,     // 1 USDT = 0.15 DOT
  DOGE: 15,      // 1 USDT = 15 DOGE
  MATIC: 1.2,    // 1 USDT = 1.2 MATIC
  LINK: 0.08,    // 1 USDT = 0.08 LINK
  UNI: 0.12,     // 1 USDT = 0.12 UNI
  ATOM: 0.1,     // 1 USDT = 0.1 ATOM
  LTC: 0.003,    // 1 USDT = 0.003 LTC
  USDC: 1,       // 1 USDT = 1 USDC
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, fromCurrency, toCurrency } = await request.json();
    
    // Get exchange rate
    const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
    const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;
    
    // Calculate converted amount
    const convertedAmount = (amount / fromRate) * toRate;
    
    // Round to 6 decimal places
    const roundedAmount = Math.round(convertedAmount * 1000000) / 1000000;
    
    return NextResponse.json({
      fromAmount: amount,
      fromCurrency,
      toAmount: roundedAmount,
      toCurrency,
      rate: toRate / fromRate
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
} 