import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { preset } from '@/lib/lovense/service';
import { resolvePublicMemberId } from '@/lib/member-access';
import { assertSessionController } from '@/lib/session-engine';

const bodySchema = z.object({
  secureToken: z.string().min(1),
  controlClientId: z.string().min(1),
  name: z.enum(['pulse', 'wave', 'fireworks', 'earthquake']),
  timeSec: z.coerce.number().int().min(0).optional(),
  toyId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const memberId = await resolvePublicMemberId(parsed.data);
    await assertSessionController(memberId, parsed.data.controlClientId);
    const result = await preset(memberId, parsed.data.name, parsed.data.timeSec ?? 0, parsed.data.toyId);
    return NextResponse.json({ result }, { status: result.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
