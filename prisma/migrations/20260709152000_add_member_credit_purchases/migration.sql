ALTER TABLE "AdminUser" ADD COLUMN "stripeConnectAccountId" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "stripeConnectOnboardingComplete" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "MemberCreditPurchase" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "ownerId" TEXT,
  "packId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "seconds" INTEGER NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'eur',
  "platformFeeCents" INTEGER NOT NULL DEFAULT 0,
  "modelRevenueCents" INTEGER NOT NULL DEFAULT 0,
  "stripeSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "stripeConnectAccountId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" DATETIME,
  CONSTRAINT "MemberCreditPurchase_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MemberCreditPurchase_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MemberCreditPurchase_stripeSessionId_key" ON "MemberCreditPurchase"("stripeSessionId");
CREATE INDEX "MemberCreditPurchase_memberId_createdAt_idx" ON "MemberCreditPurchase"("memberId", "createdAt");
CREATE INDEX "MemberCreditPurchase_ownerId_createdAt_idx" ON "MemberCreditPurchase"("ownerId", "createdAt");
CREATE INDEX "MemberCreditPurchase_status_createdAt_idx" ON "MemberCreditPurchase"("status", "createdAt");
