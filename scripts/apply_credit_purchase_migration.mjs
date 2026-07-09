import fs from 'node:fs';
import { createClient } from '@libsql/client';

for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (match && process.env[match[1]] === undefined) {
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const adminInfo = await client.execute('PRAGMA table_info("AdminUser")');
const adminColumns = new Set(adminInfo.rows.map((row) => String(row.name)));
const adminMigrations = [
  ['stripeConnectAccountId', 'ALTER TABLE "AdminUser" ADD COLUMN "stripeConnectAccountId" TEXT'],
  [
    'stripeConnectOnboardingComplete',
    'ALTER TABLE "AdminUser" ADD COLUMN "stripeConnectOnboardingComplete" BOOLEAN NOT NULL DEFAULT false',
  ],
];

for (const [name, sql] of adminMigrations) {
  if (adminColumns.has(name)) {
    console.log(`exists ${name}`);
  } else {
    await client.execute(sql);
    console.log(`added ${name}`);
  }
}

const statements = [
  `CREATE TABLE IF NOT EXISTS "MemberCreditPurchase" (
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
  )`,
  'CREATE UNIQUE INDEX IF NOT EXISTS "MemberCreditPurchase_stripeSessionId_key" ON "MemberCreditPurchase"("stripeSessionId")',
  'CREATE INDEX IF NOT EXISTS "MemberCreditPurchase_memberId_createdAt_idx" ON "MemberCreditPurchase"("memberId", "createdAt")',
  'CREATE INDEX IF NOT EXISTS "MemberCreditPurchase_ownerId_createdAt_idx" ON "MemberCreditPurchase"("ownerId", "createdAt")',
  'CREATE INDEX IF NOT EXISTS "MemberCreditPurchase_status_createdAt_idx" ON "MemberCreditPurchase"("status", "createdAt")',
];

for (const sql of statements) {
  await client.execute(sql);
}

console.log('MemberCreditPurchase ready');
