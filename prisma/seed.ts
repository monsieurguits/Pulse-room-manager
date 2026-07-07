import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

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
