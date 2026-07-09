'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getAppUrl, getStripe } from '@/lib/stripe';

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

  redirect(accountLink.url);
}
