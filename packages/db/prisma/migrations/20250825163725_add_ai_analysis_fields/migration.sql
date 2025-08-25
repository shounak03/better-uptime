-- AlterTable
ALTER TABLE "public"."WebsiteTick" ADD COLUMN     "dnsResolutionTime" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "errorType" TEXT,
ADD COLUMN     "httpStatusCode" INTEGER,
ADD COLUMN     "responseHeaders" JSONB,
ADD COLUMN     "sslExpiryDate" TIMESTAMP(3),
ADD COLUMN     "sslIssuer" TEXT,
ADD COLUMN     "sslValid" BOOLEAN;

-- CreateTable
CREATE TABLE "public"."AIAnalysis" (
    "id" TEXT NOT NULL,
    "websiteTickId" TEXT NOT NULL,
    "failureType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT NOT NULL,
    "tokens" INTEGER,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_websiteTickId_key" ON "public"."AIAnalysis"("websiteTickId");

-- AddForeignKey
ALTER TABLE "public"."AIAnalysis" ADD CONSTRAINT "AIAnalysis_websiteTickId_fkey" FOREIGN KEY ("websiteTickId") REFERENCES "public"."WebsiteTick"("id") ON DELETE CASCADE ON UPDATE CASCADE;
