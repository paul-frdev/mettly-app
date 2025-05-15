/*
  Warnings:

  - You are about to drop the column `isPaid` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "isPaid",
DROP COLUMN "time",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'scheduled',
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "email" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'active';
