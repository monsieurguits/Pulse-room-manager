'use server';

import { revalidatePath } from 'next/cache';
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
import { sendPasswordChangedEmail } from '@/lib/email';

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
export type PasswordFormState = { errors?: Record<string, string[]>; success?: boolean; emailWarning?: string };
export type LegalAcceptanceState = { error?: string };
export type WeatherCityFormState = { errors?: Record<string, string[]>; success?: boolean };

const weatherCitySchema = z.object({
  weatherCity: z
    .string()
    .trim()
    .max(80, '80 caractères maximum.')
    .optional()
    .transform((value) => value || null),
});

const allowedSubscriptionPlans = new Set(['starter', 'pro', 'premium']);

function addOneMonth(date: Date): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}

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
    redirect('/subscription');
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

  try {
    await sendPasswordChangedEmail({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return {
      success: true,
      emailWarning: (error as Error).message,
    };
  }

  return { success: true };
}

export async function updateWeatherCity(_prev: WeatherCityFormState, formData: FormData): Promise<WeatherCityFormState> {
  const admin = await requireAdmin();

  const parsed = weatherCitySchema.safeParse({
    weatherCity: formData.get('weatherCity'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: { weatherCity: parsed.data.weatherCity },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/account');

  return { success: true };
}

export async function acceptLegalTerms(_prev: LegalAcceptanceState, formData: FormData): Promise<LegalAcceptanceState> {
  const admin = await requireAdmin();
  const accepted = formData.get('accepted') === 'on';
  const selectedPlan = String(formData.get('plan') || '').toLowerCase();
  const isTrial = formData.get('trial') === '30';

  if (admin.role !== 'MODEL') {
    redirect('/dashboard');
  }

  if (!accepted) {
    return { error: 'Vous devez cocher la case pour continuer.' };
  }

  const subscriptionStartedAt = new Date();
  const subscriptionPlan = isTrial ? 'trial' : allowedSubscriptionPlans.has(selectedPlan) ? selectedPlan : 'trial';

  await db.adminUser.update({
    where: { id: admin.id },
    data: {
      legalAcceptedAt: new Date(),
      legalAcceptedVersion: LEGAL_TERMS_VERSION,
      subscriptionPlan,
      subscriptionStartedAt,
      subscriptionEndsAt: addOneMonth(subscriptionStartedAt),
    },
  });

  redirect('/dashboard');
}
