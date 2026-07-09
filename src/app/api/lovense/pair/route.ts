import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { generateQRCode } from '@/lib/lovense/service';
import { assertAdminCanAccessMember } from '@/lib/auth';
import { db } from '@/lib/db';

const bodySchema = z.object({
  memberId: z.string().min(1),
  forceRefresh: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'memberId requis.' }, { status: 400 });
  }

  try {
    await assertAdminCanAccessMember(parsed.data.memberId);
    const pairing = await generateQRCode(parsed.data.memberId, { forceRefresh: parsed.data.forceRefresh });
    const member = await db.member.findUnique({
      where: { id: parsed.data.memberId },
      select: { accessCode: true },
    });
    return NextResponse.json({
      pairing: pairing.data,
      qrImageUrl: pairing.data?.qr,
      connectionCode: pairing.data?.code ?? null,
      accessCode: member?.accessCode ?? null,
      refreshed: Boolean(parsed.data.forceRefresh),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
