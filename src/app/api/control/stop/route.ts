import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { assertSessionController, stopSession } from '@/lib/session-engine';
import { broadcast } from '@/lib/websocket/publisher';
import { resolvePublicMemberId } from '@/lib/member-access';

const bodySchema = z.object({
  secureToken: z.string().min(1),
  controlClientId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'memberId requis.' }, { status: 400 });
  }

  try {
    const memberId = await resolvePublicMemberId(parsed.data);
    await assertSessionController(memberId, parsed.data.controlClientId);
    broadcast({ type: 'session-stopped', memberId, reason: 'manual' });
    const session = await stopSession(memberId, 'manual');
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
