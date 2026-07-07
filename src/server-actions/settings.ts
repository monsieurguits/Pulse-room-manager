'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';

const baseSettingsSchema = z.object({
  callbackUrl: z.string().url('URL de callback invalide.'),
  heartbeatSeconds: z.coerce.number().int().min(5),
  applicationName: z.string().min(1),
  domain: z.string().url('Domaine invalide.'),
});

export type SettingsFormState = { errors?: Record<string, string[]>; success?: boolean };

export async function getSettings() {
  return db.settings.findUnique({ where: { id: 'settings' } });
}

export async function updateSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
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
