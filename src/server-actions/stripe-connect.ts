'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createStripeConnectUrl, getStripeErrorCode } from '@/lib/stripe-connect-link';

export async function createStripeConnectAccountLink(): Promise<void> {
  const admin = await requireAdmin();
  let accountLinkUrl: string;

  try {
    accountLinkUrl = await createStripeConnectUrl(admin.id);
  } catch (error) {
    console.error('Stripe Connect onboarding failed', error);
    if (error instanceof Error && error.message === 'stripe_missing') {
      redirect('/dashboard/account?stripe=missing');
    }
    redirect(`/dashboard/account?stripe=connect_error&stripe_error=${getStripeErrorCode(error)}`);
  }

  redirect(accountLinkUrl);
}
