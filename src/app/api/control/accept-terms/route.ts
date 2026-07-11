import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { LEGAL_TERMS_VERSION } from '@/lib/auth';

const bodySchema = z.object({
  secureToken: z.string().min(1),
  accepted: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: 'Acceptation obligatoire.' }, { status: 400 });
    }

    const member = await db.member.findUnique({
      where: { secureToken: parsed.data.secureToken },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'Lien de contrôle invalide.' }, { status: 404 });
    }

    await db.member.update({
      where: { id: member.id },
      data: { termsAcceptedAt: new Date(), termsAcceptedVersion: LEGAL_TERMS_VERSION },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
