'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getAppUrl, getStripe } from '@/lib/stripe';

function getStripeErrorCode(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybeStripeError = error as { code?: unknown; type?: unknown; raw?: { code?: unknown; type?: unknown } };
    const code = maybeStripeError.code ?? maybeStripeError.raw?.code ?? maybeStripeError.type ?? maybeStripeError.raw?.type;
    if (typeof code === 'string' && code.length > 0) {
      return code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    }
  }

  return 'unknown';
}

export async function createStripeConnectAccountLink(): Promise<void> {
  const admin = await requireAdmin();
  const stripe = getStripe();

  if (!stripe) {
    redirect('/dashboard/account?stripe=missing');
  }

  const user = await db.adminUser.findUnique({ where: { id: admin.id } });
  if (!user) {
    redirect('/dashboard/account');
  }

  let accountId = user.stripeConnectAccountId;
  let accountLinkUrl: string;

  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'FR',
        email: user.email,
        business_type: 'individual',
        metadata: {
          adminId: user.id,
        },
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      await db.adminUser.update({
        where: { id: user.id },
        data: { stripeConnectAccountId: accountId, stripeConnectOnboardingComplete: false },
      });
    }

    const appUrl = getAppUrl();
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: `${appUrl}/dashboard/account?stripe=refresh`,
      return_url: `${appUrl}/dashboard/account?stripe=connected`,
    });
    accountLinkUrl = accountLink.url;
  } catch (error) {
    console.error('Stripe Connect onboarding failed', error);
    redirect(`/dashboard/account?stripe=connect_error&stripe_error=${getStripeErrorCode(error)}`);
  }

  redirect(accountLinkUrl);
}
