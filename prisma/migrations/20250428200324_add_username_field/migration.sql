/*
  Warnings:

  - Added the required column `cryptocurrencyType` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `donationCurrency` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `donorWalletAddress` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalAmount` to the `Contribution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "cryptocurrencyType" TEXT NOT NULL,
ADD COLUMN     "fundsDistributed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "goalReached" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "donationCurrency" TEXT NOT NULL,
ADD COLUMN     "donorWalletAddress" TEXT NOT NULL,
ADD COLUMN     "originalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "refunded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactionHash" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredCrypto" TEXT,
ADD COLUMN     "walletAddresses" JSONB;

-- CreateTable
CREATE TABLE "TransactionLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "apiResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contributionId" TEXT,
    "campaignId" TEXT,

    CONSTRAINT "TransactionLog_pkey" PRIMARY KEY ("id")
);
