/*
  Warnings:

  - A unique constraint covering the columns `[telegramUsername]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "telegramUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_telegramUsername_key" ON "Client"("telegramUsername");
