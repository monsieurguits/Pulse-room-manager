'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createAdminSession, destroyAdminSession, ensureInitialOwner, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email('Email invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

export type LoginFormState = { error?: string };

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
  redirect('/dashboard');
}

export async function logoutAdmin(): Promise<void> {
  await destroyAdminSession();
  redirect('/login');
}
