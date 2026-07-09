ALTER TABLE "AdminUser" ADD COLUMN "overlayLiveActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AdminUser" ADD COLUMN "overlayLiveMemberId" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "overlayLiveUsername" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "overlayLiveToyName" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "overlayLiveIntensity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AdminUser" ADD COLUMN "overlayLivePatternJson" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "overlayLivePatternStepMs" INTEGER;
ALTER TABLE "AdminUser" ADD COLUMN "overlayLiveUpdatedAt" DATETIME;
