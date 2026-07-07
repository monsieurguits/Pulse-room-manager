ALTER TABLE "AdminUser" ADD COLUMN "overlayToken" TEXT;

CREATE UNIQUE INDEX "AdminUser_overlayToken_key" ON "AdminUser"("overlayToken");

CREATE TABLE "ControlOverlayEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "adminId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "toyName" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ControlOverlayEvent_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ControlOverlayEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ControlOverlayEvent_adminId_createdAt_idx" ON "ControlOverlayEvent"("adminId", "createdAt");
CREATE INDEX "ControlOverlayEvent_memberId_idx" ON "ControlOverlayEvent"("memberId");
