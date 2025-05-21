/*
  Warnings:

  - Made the column `status` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "telegramRemindersEnabled" BOOLEAN NOT NULL DEFAULT false;
