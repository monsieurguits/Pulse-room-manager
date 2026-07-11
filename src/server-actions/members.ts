'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { stopSession } from '@/lib/session-engine';
import { canAccessMember, memberOwnerWhere, requireAdmin } from '@/lib/auth';
import { createUniqueMemberAccessCode } from '@/lib/member-code';
import { sendMemberAccessEmail } from '@/lib/email';

const memberSchema = z.object({
  username: z.string().min(2, 'Le pseudo doit contenir au moins 2 caractères.'),
  email: z.preprocess(
    (value) => {
      const email = String(value ?? '').trim();
      return email.length > 0 ? email.toLowerCase() : null;
    },
    z.string().email('Email invalide.').nullable(),
  ),
  platform: z.string().min(1, 'La plateforme est requise.'),
  memberSince: z.coerce.date(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  // Saisi en minutes côté formulaire, converti en secondes (unité stockée en base).
  weeklyCreditMinutes: z.coerce.number().int().min(0),
});

export type MemberFormState = { errors?: Record<string, string[]>; success?: boolean; emailWarning?: string };
export type AddMemberCreditState = { errors?: Record<string, string[]>; success?: boolean; addedSeconds?: number };

const addCreditSchema = z.object({
  minutes: z.coerce.number().int().min(1, 'Minimum 1 minute.').max(10, 'Maximum 10 minutes.'),
});

export async function createMember(_prev: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const admin = await requireAdmin();
  const parsed = memberSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
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

  const accessCode = await createUniqueMemberAccessCode();
  const member = await db.member.create({
    data: {
      ...rest,
      ownerId: admin.id,
      accessCode,
      weeklyCredit,
      remainingCredit: weeklyCredit,
    },
  });

  revalidatePath('/members');
  revalidatePath('/dashboard');

  if (member.email) {
    try {
      await sendMemberAccessEmail({
        memberEmail: member.email,
        memberUsername: member.username,
        modelName: admin.name,
        modelEmail: admin.email,
        accessCode,
      });
    } catch (error) {
      return { success: true, emailWarning: (error as Error).message };
    }
  }

  return { success: true };
}

export async function updateMember(memberId: string, _prev: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const admin = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId }, select: { ownerId: true } });
  if (!member || !canAccessMember(admin, member)) {
    return { errors: { _form: ['Membre introuvable.'] } };
  }

  const parsed = memberSchema.partial().safeParse({
    username: formData.get('username') || undefined,
    email: formData.get('email') ?? undefined,
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
  const admin = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId }, select: { ownerId: true } });
  if (!member || !canAccessMember(admin, member)) return;

  await stopSession(memberId, 'manual').catch(() => undefined);
  await deleteMemberRecords([memberId]);
  revalidatePath('/members');
  revalidatePath('/dashboard');
}

export async function deleteMembers(memberIds: string[]): Promise<{ deleted: number }> {
  const admin = await requireAdmin();
  const ids = [...new Set(memberIds)].filter(Boolean);

  if (ids.length === 0) {
    return { deleted: 0 };
  }

  const members = await db.member.findMany({
    where: {
      ...memberOwnerWhere(admin),
      id: { in: ids },
    },
    select: { id: true },
  });

  const accessibleIds = members.map((member) => member.id);

  await Promise.all(accessibleIds.map((memberId) => stopSession(memberId, 'manual').catch(() => undefined)));

  const deleted = await deleteMemberRecords(accessibleIds);

  revalidatePath('/members');
  revalidatePath('/dashboard');

  return { deleted };
}

async function deleteMemberRecords(memberIds: string[]): Promise<number> {
  const ids = [...new Set(memberIds)].filter(Boolean);
  if (ids.length === 0) return 0;

  const result = await db.$transaction(async (tx) => {
    await tx.directMessage.deleteMany({ where: { memberId: { in: ids } } });
    await tx.memberCreditPurchase.deleteMany({ where: { memberId: { in: ids } } });
    await tx.tipCommand.deleteMany({ where: { memberId: { in: ids } } });
    await tx.controlOverlayEvent.deleteMany({ where: { memberId: { in: ids } } });
    await tx.session.deleteMany({ where: { memberId: { in: ids } } });
    return tx.member.deleteMany({ where: { id: { in: ids } } });
  });

  return result.count;
}

export async function suspendMember(memberId: string, suspend: boolean): Promise<void> {
  const admin = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId }, select: { ownerId: true } });
  if (!member || !canAccessMember(admin, member)) return;

  if (suspend) {
    await stopSession(memberId, 'manual').catch(() => undefined);
  }
  await db.member.update({ where: { id: memberId }, data: { active: !suspend } });
  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
}

export async function renewSubscription(memberId: string, newEndDate: Date): Promise<void> {
  const admin = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId }, select: { ownerId: true } });
  if (!member || !canAccessMember(admin, member)) return;

  await db.member.update({ where: { id: memberId }, data: { endDate: newEndDate, active: true } });
  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
}

export async function resetCredit(memberId: string): Promise<void> {
  const admin = await requireAdmin();
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });
  if (!canAccessMember(admin, member)) return;

  await db.member.update({
    where: { id: memberId },
    data: { remainingCredit: member.weeklyCredit, lastReset: new Date() },
  });
  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
}

export async function addMemberCredit(
  memberId: string,
  _prev: AddMemberCreditState,
  formData: FormData,
): Promise<AddMemberCreditState> {
  const admin = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId }, select: { ownerId: true } });
  if (!member || !canAccessMember(admin, member)) {
    return { errors: { _form: ['Membre introuvable.'] } };
  }

  const parsed = addCreditSchema.safeParse({
    minutes: formData.get('minutes'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const addedSeconds = parsed.data.minutes * 60;

  await db.member.update({
    where: { id: memberId },
    data: { remainingCredit: { increment: addedSeconds } },
  });

  revalidatePath('/members');
  revalidatePath(`/members/${memberId}`);
  revalidatePath('/dashboard');

  return { success: true, addedSeconds };
}

export async function getMemberHistory(memberId: string) {
  const admin = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId }, select: { ownerId: true } });
  if (!member || !canAccessMember(admin, member)) return [];

  return db.session.findMany({
    where: { memberId },
    orderBy: { startedAt: 'desc' },
    take: 100,
  });
}
