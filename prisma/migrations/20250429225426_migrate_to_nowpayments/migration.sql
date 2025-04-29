/*
  Warnings:

  - You are about to drop the column `walletAddress` on the `PaymentIntent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `PaymentIntent` will be added. If there are existing duplicate values, this will fail.
  - Made the column `apiResponse` on table `PaymentIntent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentId` on table `PaymentIntent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PaymentIntent" DROP CONSTRAINT "PaymentIntent_userId_fkey";

-- AlterTable
ALTER TABLE "PaymentIntent" DROP COLUMN "walletAddress",
ADD COLUMN     "estimatedSolAmount" DOUBLE PRECISION,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "apiResponse" SET NOT NULL,
ALTER COLUMN "paymentId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_paymentId_key" ON "PaymentIntent"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentIntent_userId_idx" ON "PaymentIntent"("userId");

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
