import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const db = new PrismaClient();

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const hash = crypto.pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

async function main() {
  await db.settings.upsert({
    where: { id: 'settings' },
    create: {
      id: 'settings',
      developerToken: process.env.LOVENSE_DEVELOPER_TOKEN ?? 'CHANGEME_DEVELOPER_TOKEN',
      callbackUrl: process.env.LOVENSE_CALLBACK_URL ?? 'https://example.com/api/lovense/callback',
      heartbeatSeconds: 30,
      applicationName: 'Pulse Room Manager',
      domain: process.env.APP_DOMAIN ?? 'http://localhost:3000',
    },
    update: {},
  });

  const ownerEmail = process.env.INITIAL_OWNER_EMAIL;
  const ownerPassword = process.env.INITIAL_OWNER_PASSWORD;

  if (ownerEmail && ownerPassword) {
    const owner = await db.adminUser.upsert({
      where: { email: ownerEmail.toLowerCase().trim() },
      create: {
        email: ownerEmail.toLowerCase().trim(),
        name: process.env.INITIAL_OWNER_NAME ?? 'Owner',
        role: 'OWNER',
        passwordHash: hashPassword(ownerPassword),
      },
      update: { role: 'OWNER', active: true },
    });

    await db.member.updateMany({
      where: { ownerId: null },
      data: { ownerId: owner.id },
    });
  }

  const existing = await db.member.findFirst({ where: { username: 'Demo' } });
  if (!existing) {
    await db.member.create({
      data: {
        username: 'Demo',
        platform: 'Autre',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        weeklyCredit: 3600,
        remainingCredit: 3600,
      },
    });
  }

  console.log('Seed terminé.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
