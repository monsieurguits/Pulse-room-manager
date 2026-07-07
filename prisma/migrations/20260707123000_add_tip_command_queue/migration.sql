CREATE TABLE "TipCommand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL DEFAULT 'vibrate',
    "level" INTEGER,
    "timeSec" INTEGER NOT NULL DEFAULT 5,
    "action" TEXT,
    "rule" TEXT,
    "strength" TEXT,
    "preset" TEXT,
    "source" TEXT,
    "amount" INTEGER,
    "message" TEXT,
    "error" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TipCommand_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TipCommand_memberId_idx" ON "TipCommand"("memberId");
CREATE INDEX "TipCommand_status_createdAt_idx" ON "TipCommand"("status", "createdAt");
