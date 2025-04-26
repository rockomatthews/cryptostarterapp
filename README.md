# CryptoStarter

CryptoStarter is a decentralized crowdfunding platform for crypto projects. It allows creators to raise funds for their projects in their preferred cryptocurrency, while donors can contribute in any supported cryptocurrency.

## Features

- **Campaign Creation**: Create and manage crowdfunding campaigns with the ability to set funding goals, deadlines, and select your preferred cryptocurrency.
- **Multi-Currency Donations**: Donors can contribute using any supported cryptocurrency (BTC, ETH, SOL, ADA, DOT, USDT).
- **Escrow System**: All donations are converted to stablecoin and held in escrow until the campaign deadline.
- **Automated Distribution**: If a campaign reaches its goal, funds are automatically converted to the creator's preferred cryptocurrency and distributed.
- **Automated Refunds**: If a campaign fails to meet its goal, donors receive refunds in their original donation currency.

## Supported Cryptocurrencies

- Bitcoin (BTC)
- Ethereum (ETH)
- Solana (SOL)
- Cardano (ADA)
- Polkadot (DOT)
- Tether (USDT)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- CryptoProcessing.io API account
- Google OAuth Credentials (for authentication)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cryptostarterapp.git
cd cryptostarterapp
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file with the following variables:

```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cryptostarter"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CryptoProcessing.io API
CRYPTO_PROCESSING_API_KEY=your-api-key
CRYPTO_PROCESSING_STORE_ID=your-store-id
PLATFORM_ESCROW_WALLET=your-escrow-wallet-address
PLATFORM_WALLET_TYPE=SOL

# Cron API Key (for automatic processing)
CRON_API_KEY=your-cron-api-key
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

### Google OAuth Configuration

To enable Google authentication:

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "APIs & Services" > "Credentials"
3. Create an OAuth 2.0 Client ID
4. Add the following authorized redirect URIs:
   - For local development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
5. Copy the Client ID and Client Secret to your environment variables

For Vercel deployment, ensure these environment variables are set in your Vercel project settings:

- `NEXTAUTH_URL`: Your production URL (e.g., https://cryptostarter.app)
- `NEXTAUTH_SECRET`: A secure random string (can be generated with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials

## API Integration

This project uses CryptoProcessing.io's API for handling cryptocurrency transactions. The integration is mainly handled through the `/lib/cryptoApi.ts` file, which provides functions for:

- Currency conversion
- Processing donations
- Creating payment intents
- Distributing funds after successful campaigns
- Refunding donations for failed campaigns

To use your own CryptoProcessing.io API key, update the environment variables with your API credentials.

## Scheduled Tasks

The platform includes an API endpoint for processing campaign outcomes at `/api/cron/process-campaigns`. This endpoint should be called periodically (e.g., daily) to:

1. Check for campaigns that have reached their deadline
2. Process successful campaigns by distributing funds
3. Process failed campaigns by refunding donors

You can set up a cron job to call this endpoint:

```bash
# Example cron job (daily at midnight)
0 0 * * * curl -X GET "https://your-app-url.com/api/cron/process-campaigns?api_key=your-cron-api-key"
```

## Troubleshooting

### Authentication Issues

If you encounter authentication errors:

1. Check that your environment variables are correctly set
2. Verify that the Google OAuth callback URL is correctly configured in the Google Cloud Console
3. For detailed diagnostics, visit `/auth-error` or `/api/auth/check` in your browser
4. Make sure your `NEXTAUTH_URL` matches your actual deployment URL

## Tech Stack

- **Frontend**: Next.js, Material UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Cryptocurrency**: CryptoProcessing.io API

## License

This project is licensed under the MIT License.
