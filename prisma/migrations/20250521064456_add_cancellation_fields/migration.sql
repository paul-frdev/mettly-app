-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3);
