/*
  Warnings:

  - Added the required column `walletAddress` to the `PaymentIntent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentIntent" ADD COLUMN     "walletAddress" TEXT NOT NULL;
