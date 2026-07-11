CREATE TABLE "MemberDirectMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ownerId" TEXT,
  "senderMemberId" TEXT NOT NULL,
  "recipientMemberId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readByRecipientAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MemberDirectMessage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "MemberDirectMessage_senderMemberId_fkey" FOREIGN KEY ("senderMemberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MemberDirectMessage_recipientMemberId_fkey" FOREIGN KEY ("recipientMemberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MemberDirectMessage_ownerId_createdAt_idx" ON "MemberDirectMessage"("ownerId", "createdAt");
CREATE INDEX "MemberDirectMessage_senderMemberId_recipientMemberId_createdAt_idx" ON "MemberDirectMessage"("senderMemberId", "recipientMemberId", "createdAt");
CREATE INDEX "MemberDirectMessage_recipientMemberId_readByRecipientAt_idx" ON "MemberDirectMessage"("recipientMemberId", "readByRecipientAt");
