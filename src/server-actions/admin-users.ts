'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hashPassword, requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendModelWelcomeEmail } from '@/lib/email';

const modelSchema = z.object({
  name: z.string().min(2, 'Nom requis.'),
  email: z.string().email('Email invalide.'),
  password: z.string().min(8, '8 caractères minimum.'),
});

export type ModelFormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  emailWarning?: string;
  createdEmail?: string;
  temporaryPassword?: string;
};

export async function createModelAdmin(_prev: ModelFormState, formData: FormData): Promise<ModelFormState> {
  const owner = await requireOwner();

  const parsed = modelSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ['Un compte existe déjà avec cet email.'] } };
  }

  await db.adminUser.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      role: 'MODEL',
      passwordHash: hashPassword(parsed.data.password),
    },
  });

  revalidatePath('/models');

  try {
    await sendModelWelcomeEmail({
      modelName: parsed.data.name.trim(),
      modelEmail: email,
      temporaryPassword: parsed.data.password,
      adminEmail: owner.email,
    });
  } catch (error) {
    return {
      success: true,
      emailWarning: (error as Error).message,
      createdEmail: email,
      temporaryPassword: parsed.data.password,
    };
  }

  return { success: true };
}

export async function setModelActive(modelId: string, active: boolean): Promise<void> {
  const owner = await requireOwner();
  if (modelId === owner.id) return;
  await db.adminUser.update({
    where: { id: modelId },
    data: { active },
  });
  revalidatePath('/models');
}

export async function resetModelPassword(modelId: string, formData: FormData): Promise<void> {
  const owner = await requireOwner();
  if (modelId === owner.id) return;
  const password = String(formData.get('password') ?? '');
  if (password.length < 8) return;

  await db.adminUser.update({
    where: { id: modelId },
    data: { passwordHash: hashPassword(password) },
  });
  await db.adminSession.deleteMany({ where: { userId: modelId } });
  revalidatePath('/models');
}

export async function deleteModelAdmin(modelId: string): Promise<void> {
  const owner = await requireOwner();

  const model = await db.adminUser.findUnique({
    where: { id: modelId },
    select: { id: true, role: true },
  });

  if (!model || model.id === owner.id || !['MODEL', 'OWNER'].includes(model.role)) return;

  await db.$transaction([
    db.member.updateMany({
      where: { ownerId: modelId },
      data: { ownerId: owner.id },
    }),
    db.adminSession.deleteMany({ where: { userId: modelId } }),
    db.adminUser.delete({ where: { id: modelId } }),
  ]);

  revalidatePath('/models');
  revalidatePath('/members');
  revalidatePath('/dashboard');
}

export async function promoteModelToOwner(modelId: string): Promise<void> {
  await requireOwner();

  const model = await db.adminUser.findUnique({
    where: { id: modelId },
    select: { id: true, role: true },
  });

  if (!model || model.role !== 'MODEL') return;

  await db.adminUser.update({
    where: { id: modelId },
    data: { role: 'OWNER' },
  });

  await db.adminSession.deleteMany({ where: { userId: modelId } });

  revalidatePath('/models');
  revalidatePath('/dashboard');
}
