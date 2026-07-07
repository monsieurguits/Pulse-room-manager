-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "secureToken" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "weeklyCredit" INTEGER NOT NULL,
    "remainingCredit" INTEGER NOT NULL,
    "lastReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isControlling" BOOLEAN NOT NULL DEFAULT false,
    "lovenseUserId" TEXT,
    "toyId" TEXT,
    "toyName" TEXT,
    "toyType" TEXT,
    "battery" INTEGER,
    "deviceDomain" TEXT,
    "httpsPort" INTEGER,
    "wsPort" INTEGER,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "creditUsed" INTEGER NOT NULL DEFAULT 0,
    "creditRemaining" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'settings',
    "developerToken" TEXT NOT NULL,
    "callbackUrl" TEXT NOT NULL,
    "heartbeatSeconds" INTEGER NOT NULL DEFAULT 30,
    "applicationName" TEXT NOT NULL DEFAULT 'Vulse Control Manager',
    "domain" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_secureToken_key" ON "Member"("secureToken");

-- CreateIndex
CREATE INDEX "Member_secureToken_idx" ON "Member"("secureToken");

-- CreateIndex
CREATE INDEX "Member_active_idx" ON "Member"("active");

-- CreateIndex
CREATE INDEX "Session_memberId_idx" ON "Session"("memberId");

-- CreateIndex
CREATE INDEX "Session_active_idx" ON "Session"("active");
