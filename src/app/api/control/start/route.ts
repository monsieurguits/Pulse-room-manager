import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { startSession } from '@/lib/session-engine';
import { broadcast } from '@/lib/websocket/publisher';
import { resolveMemberId } from '@/lib/member-access';
import { getEffectiveLovenseStatus } from '@/lib/lovense/service';

const bodySchema = z.object({
  memberId: z.string().min(1).optional(),
  secureToken: z.string().min(1).optional(),
  controlClientId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'memberId requis.' }, { status: 400 });
  }

  try {
    const memberId = await resolveMemberId(parsed.data);
    const deviceStatus = await getEffectiveLovenseStatus(memberId);

    if (!deviceStatus.connected) {
      return NextResponse.json({ error: "L'appareil Lovense est déconnecté." }, { status: 409 });
    }

    const session = await startSession(memberId, parsed.data.controlClientId);
    broadcast({ type: 'session-started', memberId, sessionId: session.id, controlClientId: session.controlClientId });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
