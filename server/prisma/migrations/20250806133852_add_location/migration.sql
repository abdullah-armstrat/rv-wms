-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "qrPath" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "public"."Location"("code");

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
