'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { stopSession } from '@/lib/session-engine';

const memberSchema = z.object({
  username: z.string().min(2, 'Le pseudo doit contenir au moins 2 caractères.'),
  platform: z.string().min(1, 'La plateforme est requise.'),
  memberSince: z.coerce.date(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  // Saisi en minutes côté formulaire, converti en secondes (unité stockée en base).
  weeklyCreditMinutes: z.coerce.number().int().min(0),
});

export type MemberFormState = { errors?: Record<string, string[]>; success?: boolean };

export async function createMember(_prev: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const parsed = memberSchema.safeParse({
    username: formData.get('username'),
    platform: formData.get('platform'),
    memberSince: formData.get('memberSince'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    weeklyCreditMinutes: formData.get('weeklyCredit'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { weeklyCreditMinutes, ...rest } = parsed.data;
  const weeklyCredit = weeklyCreditMinutes * 60;

  await db.member.create({
    data: {
      ...rest,
      weeklyCredit,
      remainingCredit: weeklyCredit,
    },
  });

  revalidatePath('/members');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateMember(memberId: string, _prev: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const parsed = memberSchema.partial().safeParse({
    username: formData.get('username') || undefined,
    platform: formData.get('platform') || undefined,
    memberSince: formData.get('memberSince') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    weeklyCreditMinutes: formData.get('weeklyCredit') || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { weeklyCreditMinutes, ...rest } = parsed.data;

  await db.member.update({
    where: { id: memberId },
    data: {
      ...rest,
      ...(typeof weeklyCreditMinutes === 'number' ? { weeklyCredit: weeklyCreditMinutes * 60 } : {}),
    },
  });

  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteMember(memberId: string): Promise<void> {
  await stopSession(memberId, 'manual').catch(() => undefined);
  await db.member.delete({ where: { id: memberId } });
  revalidatePath('/members');
  revalidatePath('/dashboard');
}

export async function suspendMember(memberId: string, suspend: boolean): Promise<void> {
  if (suspend) {
    await stopSession(memberId, 'manual').catch(() => undefined);
  }
  await db.member.update({ where: { id: memberId }, data: { active: !suspend } });
  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
}

export async function renewSubscription(memberId: string, newEndDate: Date): Promise<void> {
  await db.member.update({ where: { id: memberId }, data: { endDate: newEndDate, active: true } });
  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
}

export async function resetCredit(memberId: string): Promise<void> {
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });
  await db.member.update({
    where: { id: memberId },
    data: { remainingCredit: member.weeklyCredit, lastReset: new Date() },
  });
  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
}

export async function getMemberHistory(memberId: string) {
  return db.session.findMany({
    where: { memberId },
    orderBy: { startedAt: 'desc' },
    take: 100,
  });
}
