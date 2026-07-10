import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { generateQRCode } from '@/lib/lovense/service';
import { canAccessMember, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendMemberAccessEmail } from '@/lib/email';

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
    const admin = await requireAdmin();
    const memberBefore = await db.member.findUnique({
      where: { id: parsed.data.memberId },
      select: { ownerId: true },
    });

    if (!memberBefore || !canAccessMember(admin, memberBefore)) {
      throw new Error('Membre introuvable.');
    }

    const pairing = await generateQRCode(parsed.data.memberId, { forceRefresh: parsed.data.forceRefresh });
    const member = await db.member.findUnique({
      where: { id: parsed.data.memberId },
      select: { username: true, email: true, accessCode: true },
    });
    let emailWarning: string | null = null;

    if (parsed.data.forceRefresh && member?.email && member.accessCode) {
      try {
        await sendMemberAccessEmail({
          memberEmail: member.email,
          memberUsername: member.username,
          modelName: admin.name,
          modelEmail: admin.email,
          accessCode: member.accessCode,
          isReset: true,
        });
      } catch (error) {
        emailWarning = (error as Error).message;
      }
    }

    return NextResponse.json({
      pairing: pairing.data,
      qrImageUrl: pairing.data?.qr,
      connectionCode: pairing.data?.code ?? null,
      accessCode: member?.accessCode ?? null,
      refreshed: Boolean(parsed.data.forceRefresh),
      emailSent: Boolean(parsed.data.forceRefresh && member?.email && member.accessCode && !emailWarning),
      emailWarning,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
