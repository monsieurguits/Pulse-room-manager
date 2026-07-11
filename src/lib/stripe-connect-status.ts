import { db } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

export async function syncStripeConnectAccountStatus(adminId: string, accountId: string): Promise<boolean> {
  const stripe = getStripe();
  if (!stripe) return false;

  const account = await stripe.accounts.retrieve(accountId);
  const complete = Boolean(account.details_submitted && account.charges_enabled && account.payouts_enabled);

  await db.adminUser.updateMany({
    where: { id: adminId, stripeConnectAccountId: accountId },
    data: { stripeConnectOnboardingComplete: complete },
  });

  return complete;
}
