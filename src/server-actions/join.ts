'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { normalizeMemberAccessCode } from '@/lib/member-code';

const joinSchema = z.object({
  code: z.string().min(1, 'Code requis.'),
});

export type JoinFormState = { error?: string };

export async function joinMemberByCode(_prev: JoinFormState, formData: FormData): Promise<JoinFormState> {
  const parsed = joinSchema.safeParse({
    code: formData.get('code'),
  });

  if (!parsed.success) {
    return { error: 'Entre ton code membre.' };
  }

  const code = normalizeMemberAccessCode(parsed.data.code);
  const member = await db.member.findUnique({
    where: { accessCode: code },
    select: { secureToken: true, active: true },
  });

  if (!member) {
    return { error: 'Code membre introuvable.' };
  }

  redirect(`/control/${member.secureToken}`);
}
