import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const settingsSchema = z.object({
  developerToken: z.string().min(10),
  callbackUrl: z.string().url(),
  heartbeatSeconds: z.coerce.number().int().min(5),
  applicationName: z.string().min(1),
  domain: z.string().url(),
});

export async function GET() {
  const settings = await db.settings.findUnique({ where: { id: 'settings' } });
  if (!settings) {
    return NextResponse.json({ settings: null });
  }
  // Le Developer Token n'est jamais renvoyé tel quel côté client, même via l'API interne.
  const { developerToken, ...safe } = settings;
  return NextResponse.json({ settings: { ...safe, developerToken: maskToken(developerToken) } });
}

export async function PUT(request: NextRequest) {
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const settings = await db.settings.upsert({
    where: { id: 'settings' },
    create: { id: 'settings', ...parsed.data },
    update: parsed.data,
  });

  const { developerToken, ...safe } = settings;
  return NextResponse.json({ settings: { ...safe, developerToken: maskToken(developerToken) } });
}

function maskToken(token: string): string {
  if (token.length <= 8) return '••••••••';
  return `${token.slice(0, 4)}${'•'.repeat(token.length - 8)}${token.slice(-4)}`;
}
