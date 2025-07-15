-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxClients" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'individual',
ALTER COLUMN "client_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ClientOnAppointment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientOnAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientOnAppointment_appointmentId_clientId_key" ON "ClientOnAppointment"("appointmentId", "clientId");

-- AddForeignKey
ALTER TABLE "ClientOnAppointment" ADD CONSTRAINT "ClientOnAppointment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientOnAppointment" ADD CONSTRAINT "ClientOnAppointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
