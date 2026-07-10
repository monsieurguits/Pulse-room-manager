CREATE TABLE "AdminDirectMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "senderAdminId" TEXT NOT NULL,
  "recipientAdminId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readByRecipientAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminDirectMessage_senderAdminId_fkey" FOREIGN KEY ("senderAdminId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdminDirectMessage_recipientAdminId_fkey" FOREIGN KEY ("recipientAdminId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "AdminDirectMessage_senderAdminId_recipientAdminId_createdAt_idx" ON "AdminDirectMessage"("senderAdminId", "recipientAdminId", "createdAt");
CREATE INDEX "AdminDirectMessage_recipientAdminId_readByRecipientAt_idx" ON "AdminDirectMessage"("recipientAdminId", "readByRecipientAt");
CREATE INDEX "AdminDirectMessage_recipientAdminId_createdAt_idx" ON "AdminDirectMessage"("recipientAdminId", "createdAt");
