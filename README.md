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

Create a `.env` file with the following variables:

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
CRYPTO_PROCESSING_API_SECRET=your-api-secret

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

## Tech Stack

- **Frontend**: Next.js, Material UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Cryptocurrency**: CryptoProcessing.io API

## License

This project is licensed under the MIT License.
