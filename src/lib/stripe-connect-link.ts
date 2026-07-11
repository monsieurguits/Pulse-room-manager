import { db } from '@/lib/db';
import { getAppUrl, getStripe } from '@/lib/stripe';

type StripeErrorLike = {
  code?: unknown;
  message?: unknown;
  param?: unknown;
  type?: unknown;
  raw?: {
    code?: unknown;
    message?: unknown;
    param?: unknown;
    type?: unknown;
  };
};

function getStripeErrorValue(error: unknown, key: keyof StripeErrorLike): string | null {
  if (!error || typeof error !== 'object') return null;

  const maybeStripeError = error as StripeErrorLike;
  const value = maybeStripeError[key] ?? maybeStripeError.raw?.[key as keyof NonNullable<StripeErrorLike['raw']>];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function getStripeErrorCode(error: unknown): string {
  const code = getStripeErrorValue(error, 'code') ?? getStripeErrorValue(error, 'type');
  if (code) {
    return code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  }

  return 'unknown';
}

export function getStripeErrorDetail(error: unknown): string {
  const code = getStripeErrorCode(error);
  const message = getStripeErrorValue(error, 'message');
  if (!message) return code;

  return `${code}: ${message}`.replace(/[\r\n]+/g, ' ').slice(0, 240);
}

function isMissingStoredStripeAccount(error: unknown): boolean {
  const code = getStripeErrorValue(error, 'code');
  const message = getStripeErrorValue(error, 'message')?.toLowerCase() ?? '';

  return code === 'resource_missing' || message.includes('no such account');
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

  const stripeClient = stripe;
  const connectUser = user;

  async function createConnectedAccount(): Promise<string> {
    const account = await stripeClient.accounts.create({
      type: 'express',
      country: 'FR',
      email: connectUser.email,
      business_type: 'individual',
      metadata: {
        adminId: connectUser.id,
      },
      capabilities: {
        transfers: { requested: true },
      },
    });

    await db.adminUser.update({
      where: { id: connectUser.id },
      data: { stripeConnectAccountId: account.id, stripeConnectOnboardingComplete: false },
    });

    return account.id;
  }

  let accountId = connectUser.stripeConnectAccountId;
  if (!accountId) {
    accountId = await createConnectedAccount();
  }

  let account;
  try {
    account = await stripeClient.accounts.retrieve(accountId);
  } catch (error) {
    if (!isMissingStoredStripeAccount(error)) {
      throw error;
    }

    accountId = await createConnectedAccount();
    account = await stripeClient.accounts.retrieve(accountId);
  }
  const onboardingComplete = Boolean(account.details_submitted && account.charges_enabled && account.payouts_enabled);

  await db.adminUser.updateMany({
    where: { id: connectUser.id, stripeConnectAccountId: accountId },
    data: { stripeConnectOnboardingComplete: onboardingComplete },
  });

  if (onboardingComplete) {
    const loginLink = await stripeClient.accounts.createLoginLink(accountId);
    return loginLink.url;
  }

  const appUrl = getAppUrl();
  const accountLink = await stripeClient.accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    refresh_url: `${appUrl}/dashboard/account?stripe=refresh`,
    return_url: `${appUrl}/dashboard/account?stripe=connected`,
  });

  return accountLink.url;
}
