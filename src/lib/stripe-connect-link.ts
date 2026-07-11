import { db } from '@/lib/db';
import { getAppUrl, getStripe } from '@/lib/stripe';

export function getStripeErrorCode(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybeStripeError = error as { code?: unknown; type?: unknown; raw?: { code?: unknown; type?: unknown } };
    const code = maybeStripeError.code ?? maybeStripeError.raw?.code ?? maybeStripeError.type ?? maybeStripeError.raw?.type;
    if (typeof code === 'string' && code.length > 0) {
      return code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    }
  }

  return 'unknown';
}

export async function createStripeConnectUrl(userId: string): Promise<string> {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error('stripe_missing');
  }

  const user = await db.adminUser.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('account_not_found');
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

  const account = await stripe.accounts.retrieve(accountId);
  const onboardingComplete = Boolean(account.details_submitted && account.charges_enabled && account.payouts_enabled);

  await db.adminUser.updateMany({
    where: { id: user.id, stripeConnectAccountId: accountId },
    data: { stripeConnectOnboardingComplete: onboardingComplete },
  });

  if (onboardingComplete) {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  }

  const appUrl = getAppUrl();
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    type: account.details_submitted ? 'account_update' : 'account_onboarding',
    refresh_url: `${appUrl}/dashboard/account?stripe=refresh`,
    return_url: `${appUrl}/dashboard/account?stripe=connected`,
  });

  return accountLink.url;
}
