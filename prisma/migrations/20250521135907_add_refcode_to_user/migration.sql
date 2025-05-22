/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "reminderTimeHours" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "telegramRemindersEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "clientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "holidays" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "refCode" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'trainer',
ADD COLUMN     "slotDuration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "workingHours" JSONB DEFAULT '{"monday":{"start":"09:00","end":"17:00"},"tuesday":{"start":"09:00","end":"17:00"},"wednesday":{"start":"09:00","end":"17:00"},"thursday":{"start":"09:00","end":"17:00"},"friday":{"start":"09:00","end":"17:00"},"saturday":{"start":"10:00","end":"15:00"},"sunday":{"start":"10:00","end":"15:00"}}',
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "telegramRemindersEnabled" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_refCode_key" ON "users"("refCode");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
