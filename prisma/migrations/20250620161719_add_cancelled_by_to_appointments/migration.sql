-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "cancelled_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
