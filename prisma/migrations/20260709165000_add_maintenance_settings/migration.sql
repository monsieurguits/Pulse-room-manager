ALTER TABLE "Settings" ADD COLUMN "maintenanceActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Settings" ADD COLUMN "maintenanceStartAt" DATETIME;
ALTER TABLE "Settings" ADD COLUMN "maintenanceEndAt" DATETIME;
ALTER TABLE "Settings" ADD COLUMN "maintenanceSiteUsable" BOOLEAN NOT NULL DEFAULT true;
