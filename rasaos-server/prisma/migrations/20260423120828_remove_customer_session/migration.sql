/*
  Warnings:

  - You are about to drop the column `customerSessionId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `CustomerSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomerSession" DROP CONSTRAINT "CustomerSession_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerSessionId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerSessionId",
ADD COLUMN     "customerId" TEXT;

-- DropTable
DROP TABLE "CustomerSession";
