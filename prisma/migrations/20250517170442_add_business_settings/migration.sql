-- CreateTable
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "workingHours" JSONB NOT NULL,
    "workingDays" TEXT[],
    "slotDuration" INTEGER NOT NULL,
    "holidays" TIMESTAMP(3)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_settings_userId_key" ON "business_settings"("userId");

-- AddForeignKey
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
