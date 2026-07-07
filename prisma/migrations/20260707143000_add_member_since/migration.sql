ALTER TABLE "Member" ADD COLUMN "memberSince" DATETIME;

UPDATE "Member"
SET "memberSince" = "createdAt"
WHERE "memberSince" IS NULL;
