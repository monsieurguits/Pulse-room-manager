import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { vibrate } from '@/lib/lovense/service';
import { resolveMemberId } from '@/lib/member-access';
import { assertSessionController } from '@/lib/session-engine';

const bodySchema = z.object({
  memberId: z.string().min(1).optional(),
  secureToken: z.string().min(1).optional(),
  controlClientId: z.string().min(1),
  level: z.coerce.number().int().min(0).max(20),
  timeSec: z.coerce.number().int().min(0).optional(),
  toyId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const memberId = await resolveMemberId(parsed.data);
    await assertSessionController(memberId, parsed.data.controlClientId);
    const result = await vibrate(memberId, parsed.data.level, parsed.data.timeSec ?? 0, parsed.data.toyId);
    return NextResponse.json({ result }, { status: result.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
