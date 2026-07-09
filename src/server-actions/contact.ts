'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { CONTACT_PLATFORMS } from '@/lib/contact-platforms';
import { sendModelContactRequestEmail } from '@/lib/email';

const contactRequestSchema = z.object({
  lastName: z.string().trim().min(1, 'Nom requis.').max(80, '80 caractères maximum.'),
  firstName: z.string().trim().min(1, 'Prénom requis.').max(80, '80 caractères maximum.'),
  pseudo: z.string().trim().min(1, 'Pseudo requis.').max(80, '80 caractères maximum.'),
  email: z.string().trim().email('Email invalide.').max(120, '120 caractères maximum.'),
  platforms: z.array(z.enum(CONTACT_PLATFORMS)).min(1, 'Sélectionnez au moins une plateforme.'),
  message: z.string().trim().max(1200, '1200 caractères maximum.').optional(),
  contactConsent: z.literal('on', { error: 'Vous devez accepter d’être contacté par email.' }),
});

export type ContactRequestState = {
  errors?: Record<string, string[]>;
  error?: string;
};

export async function submitModelContactRequest(
  _prev: ContactRequestState,
  formData: FormData,
): Promise<ContactRequestState> {
  const parsed = contactRequestSchema.safeParse({
    lastName: formData.get('lastName'),
    firstName: formData.get('firstName'),
    pseudo: formData.get('pseudo'),
    email: formData.get('email'),
    platforms: formData.getAll('platforms'),
    message: formData.get('message') || undefined,
    contactConsent: formData.get('contactConsent'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await sendModelContactRequestEmail(parsed.data);
  } catch (error) {
    return { error: (error as Error).message };
  }

  redirect('/login?contact=sent');
}
