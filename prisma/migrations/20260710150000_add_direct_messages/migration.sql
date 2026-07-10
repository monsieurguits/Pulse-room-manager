CREATE TABLE "DirectMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ownerId" TEXT,
  "memberId" TEXT NOT NULL,
  "sender" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readByModelAt" DATETIME,
  "readByMemberAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DirectMessage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "DirectMessage_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "DirectMessage_ownerId_createdAt_idx" ON "DirectMessage"("ownerId", "createdAt");
CREATE INDEX "DirectMessage_memberId_createdAt_idx" ON "DirectMessage"("memberId", "createdAt");
CREATE INDEX "DirectMessage_ownerId_readByModelAt_idx" ON "DirectMessage"("ownerId", "readByModelAt");
CREATE INDEX "DirectMessage_memberId_readByMemberAt_idx" ON "DirectMessage"("memberId", "readByMemberAt");
