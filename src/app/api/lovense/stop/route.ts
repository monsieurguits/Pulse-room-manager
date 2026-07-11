import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { stop, stopAll } from '@/lib/lovense/service';
import { resolvePublicMemberId } from '@/lib/member-access';
import { assertSessionController } from '@/lib/session-engine';
import { requireOwner } from '@/lib/auth';

const bodySchema = z.object({
  secureToken: z.string().min(1).optional(),
  controlClientId: z.string().min(1).optional(),
  toyId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  if (parsed.data.secureToken) {
    try {
      if (!parsed.data.controlClientId) {
        return NextResponse.json({ error: 'controlClientId requis.' }, { status: 400 });
      }
      const memberId = await resolvePublicMemberId(parsed.data);
      await assertSessionController(memberId, parsed.data.controlClientId);
      const result = await stop(memberId, parsed.data.toyId);
      return NextResponse.json({ result }, { status: result.ok ? 200 : 502 });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 409 });
    }
  }

  await requireOwner();
  await stopAll();
  return NextResponse.json({ ok: true, message: 'Tous les jouets ont été stoppés.' });
}
