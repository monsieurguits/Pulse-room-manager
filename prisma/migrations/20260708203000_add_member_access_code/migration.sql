ALTER TABLE "Member" ADD COLUMN "accessCode" TEXT;
CREATE UNIQUE INDEX "Member_accessCode_key" ON "Member"("accessCode");
