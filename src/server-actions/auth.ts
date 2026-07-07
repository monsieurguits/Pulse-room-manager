'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  createAdminSession,
  destroyAdminSession,
  ensureInitialOwner,
  hashPassword,
  LEGAL_TERMS_VERSION,
  requireAdmin,
  verifyPassword,
} from '@/lib/auth';
import { db } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email('Email invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis.'),
    newPassword: z.string().min(8, '8 caractères minimum.'),
    confirmPassword: z.string().min(1, 'Confirmation requise.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Les mots de passe ne correspondent pas.',
  });

export type LoginFormState = { error?: string };
export type PasswordFormState = { errors?: Record<string, string[]>; success?: boolean };
export type LegalAcceptanceState = { error?: string };

export async function loginAdmin(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  await ensureInitialOwner();

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: 'Identifiants invalides.' };
  }

  const user = await db.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });

  if (!user || !user.active || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { error: 'Identifiants invalides.' };
  }

  await createAdminSession(user.id);
  if (user.role === 'MODEL' && user.legalAcceptedVersion !== LEGAL_TERMS_VERSION) {
    redirect('/legal/accept');
  }

  redirect('/dashboard');
}

export async function logoutAdmin(): Promise<void> {
  await destroyAdminSession();
  redirect('/login');
}

export async function logoutAllAdminSessions(): Promise<void> {
  const admin = await requireAdmin();
  await db.adminSession.deleteMany({ where: { userId: admin.id } });
  await destroyAdminSession();
  redirect('/login');
}

export async function changeOwnPassword(_prev: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  const admin = await requireAdmin();

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const user = await db.adminUser.findUnique({ where: { id: admin.id } });
  if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    return { errors: { currentPassword: ['Mot de passe actuel incorrect.'] } };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });

  await db.adminSession.deleteMany({ where: { userId: admin.id } });

  await createAdminSession(admin.id);
  return { success: true };
}

export async function acceptLegalTerms(_prev: LegalAcceptanceState, formData: FormData): Promise<LegalAcceptanceState> {
  const admin = await requireAdmin();
  const accepted = formData.get('accepted') === 'on';

  if (admin.role !== 'MODEL') {
    redirect('/dashboard');
  }

  if (!accepted) {
    return { error: 'Vous devez cocher la case pour continuer.' };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: {
      legalAcceptedAt: new Date(),
      legalAcceptedVersion: LEGAL_TERMS_VERSION,
    },
  });

  redirect('/dashboard');
}
