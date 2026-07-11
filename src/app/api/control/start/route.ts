import { after, NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { startSession, stopSession } from '@/lib/session-engine';
import { broadcast } from '@/lib/websocket/publisher';
import { resolvePublicMemberId } from '@/lib/member-access';
import { getEffectiveLovenseStatus, vibrate } from '@/lib/lovense/service';

const bodySchema = z.object({
  secureToken: z.string().min(1),
  controlClientId: z.string().min(1),
  initialLevel: z.coerce.number().int().min(0).max(20).optional(),
  toyId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'memberId requis.' }, { status: 400 });
  }

  try {
    const memberId = await resolvePublicMemberId(parsed.data);
    const deviceStatus = await getEffectiveLovenseStatus(memberId);

    if (!deviceStatus.connected) {
      return NextResponse.json({ error: "L'appareil Lovense est déconnecté." }, { status: 409 });
    }

    const session = await startSession(memberId, parsed.data.controlClientId);
    broadcast({ type: 'session-started', memberId, sessionId: session.id, controlClientId: session.controlClientId });

    if (typeof parsed.data.initialLevel === 'number') {
      after(async () => {
        const result = await vibrate(memberId, parsed.data.initialLevel!, 0, parsed.data.toyId).catch((error) => ({
          ok: false,
          message: (error as Error).message,
        }));

        if (!result.ok) {
          await stopSession(memberId, 'manual').catch(() => undefined);
        }
      });
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
