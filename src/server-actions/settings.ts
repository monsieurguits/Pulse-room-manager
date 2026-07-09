'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireOwner } from '@/lib/auth';

const baseSettingsSchema = z.object({
  callbackUrl: z.string().url('URL de callback invalide.'),
  heartbeatSeconds: z.coerce.number().int().min(5),
  applicationName: z.string().min(1),
  domain: z.string().url('Domaine invalide.'),
});

export type SettingsFormState = { errors?: Record<string, string[]>; success?: boolean };
export type MaintenanceFormState = { errors?: Record<string, string[]>; success?: boolean };

const maintenanceSchema = z
  .object({
    maintenanceActive: z.boolean(),
    maintenanceStartAt: z.string().optional().transform((value) => value || null),
    maintenanceEndAt: z.string().optional().transform((value) => value || null),
    maintenanceSiteUsable: z.enum(['yes', 'no']),
  })
  .refine((data) => !data.maintenanceActive || Boolean(data.maintenanceStartAt), {
    path: ['maintenanceStartAt'],
    message: 'Date et heure de début requises.',
  })
  .refine((data) => !data.maintenanceActive || Boolean(data.maintenanceEndAt), {
    path: ['maintenanceEndAt'],
    message: 'Date et heure de fin requises.',
  })
  .refine(
    (data) =>
      !data.maintenanceStartAt ||
      !data.maintenanceEndAt ||
      new Date(data.maintenanceEndAt).getTime() > new Date(data.maintenanceStartAt).getTime(),
    {
      path: ['maintenanceEndAt'],
      message: 'La fin doit être après le début.',
    },
  );

export async function getSettings() {
  await requireOwner();
  return db.settings.findUnique({ where: { id: 'settings' } });
}

export async function updateSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireOwner();
  const rawToken = formData.get('developerToken');
  const tokenProvided = typeof rawToken === 'string' && rawToken.trim().length > 0;

  const parsed = baseSettingsSchema.safeParse({
    callbackUrl: formData.get('callbackUrl'),
    heartbeatSeconds: formData.get('heartbeatSeconds'),
    applicationName: formData.get('applicationName'),
    domain: formData.get('domain'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.settings.findUnique({ where: { id: 'settings' } });

  if (!existing && !tokenProvided) {
    return { errors: { developerToken: ['Le Developer Token est requis à la première configuration.'] } };
  }

  if (tokenProvided && (rawToken as string).trim().length < 10) {
    return { errors: { developerToken: ['Le Developer Token semble invalide.'] } };
  }

  await db.settings.upsert({
    where: { id: 'settings' },
    create: { id: 'settings', ...parsed.data, developerToken: (rawToken as string).trim() },
    update: {
      ...parsed.data,
      ...(tokenProvided ? { developerToken: (rawToken as string).trim() } : {}),
    },
  });

  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function updateMaintenanceMode(
  _prev: MaintenanceFormState,
  formData: FormData,
): Promise<MaintenanceFormState> {
  await requireOwner();

  const parsed = maintenanceSchema.safeParse({
    maintenanceActive: formData.get('maintenanceActive') === 'on',
    maintenanceStartAt: formData.get('maintenanceStartAt'),
    maintenanceEndAt: formData.get('maintenanceEndAt'),
    maintenanceSiteUsable: formData.get('maintenanceSiteUsable') === 'no' ? 'no' : 'yes',
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.settings.findUnique({ where: { id: 'settings' } });
  if (!existing) {
    return { errors: { maintenanceActive: ['Configurez d’abord les paramètres Lovense dans Paramètres.'] } };
  }

  await db.settings.update({
    where: { id: 'settings' },
    data: {
      maintenanceActive: parsed.data.maintenanceActive,
      maintenanceStartAt: parsed.data.maintenanceStartAt ? new Date(parsed.data.maintenanceStartAt) : null,
      maintenanceEndAt: parsed.data.maintenanceEndAt ? new Date(parsed.data.maintenanceEndAt) : null,
      maintenanceSiteUsable: parsed.data.maintenanceSiteUsable === 'yes',
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/members');
  revalidatePath('/dashboard/account');
  revalidatePath('/dashboard/technical');
  return { success: true };
}
