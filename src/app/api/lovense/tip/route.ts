import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { enqueueTipCommand } from '@/lib/lovense/service';
import { resolveMemberId } from '@/lib/member-access';

const bodySchema = z.object({
  memberId: z.string().min(1).optional(),
  secureToken: z.string().min(1).optional(),
  type: z.enum(['vibrate', 'pattern', 'preset', 'function']).default('vibrate'),
  level: z.coerce.number().int().min(0).max(20).optional(),
  timeSec: z.coerce.number().int().min(1).max(60).default(5),
  action: z.string().min(1).optional(),
  rule: z.string().min(1).optional(),
  strength: z.string().min(1).optional(),
  preset: z.enum(['pulse', 'wave', 'fireworks', 'earthquake']).optional(),
  source: z.string().min(1).max(80).optional(),
  amount: z.coerce.number().int().min(0).optional(),
  message: z.string().max(240).optional(),
});

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.TIP_WEBHOOK_SECRET?.trim();

  if (configuredSecret) {
    const headerSecret = request.headers.get('x-tip-secret')?.trim();
    const bearerSecret = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

    if (headerSecret !== configuredSecret && bearerSecret !== configuredSecret) {
      return NextResponse.json({ error: 'Webhook tip non autorisé.' }, { status: 401 });
    }
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const memberId = parsed.data.memberId || parsed.data.secureToken
      ? await resolveMemberId(parsed.data)
      : await resolveDefaultTipMemberId();

    const result = await enqueueTipCommand({
      memberId,
      type: parsed.data.type,
      level: parsed.data.level,
      timeSec: parsed.data.timeSec,
      action: parsed.data.action,
      rule: parsed.data.rule,
      strength: parsed.data.strength,
      preset: parsed.data.preset,
      source: parsed.data.source,
      amount: parsed.data.amount,
      message: parsed.data.message,
    });

    return NextResponse.json({
      ok: true,
      status: result.status,
      tipId: result.tip.id,
      memberId: result.tip.memberId,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}

async function resolveDefaultTipMemberId(): Promise<string> {
  const member = await db.member.findFirst({
    where: {
      active: true,
      lovenseUserId: { not: null },
      deviceDomain: { not: null },
      httpsPort: { not: null },
    },
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  });

  if (!member) {
    throw new Error('Aucun membre avec un jouet Lovense connecté disponible pour recevoir le tip.');
  }

  return member.id;
}
