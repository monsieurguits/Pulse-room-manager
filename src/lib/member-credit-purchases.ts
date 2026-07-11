import Stripe from 'stripe';
import { db } from '@/lib/db';

async function getStripeFeeCents(stripe: Stripe | undefined, session: Stripe.Checkout.Session): Promise<number> {
  if (!stripe) return 0;

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;
  if (!paymentIntentId) return 0;

  const paymentIntent = await stripe.paymentIntents
    .retrieve(paymentIntentId, { expand: ['latest_charge.balance_transaction'] })
    .catch(() => null);
  if (!paymentIntent || typeof paymentIntent.latest_charge === 'string' || !paymentIntent.latest_charge) return 0;

  const balanceTransaction = paymentIntent.latest_charge.balance_transaction;
  const balance = typeof balanceTransaction === 'string'
    ? await stripe.balanceTransactions.retrieve(balanceTransaction).catch(() => null)
    : balanceTransaction;

  if (!balance || typeof balance === 'string') return 0;

  const stripeFee = balance.fee_details?.find((fee) => fee.type === 'stripe_fee');
  if (stripeFee && Number.isFinite(stripeFee.amount)) return Math.max(0, stripeFee.amount);

  return Number.isFinite(balance.fee) ? Math.max(0, balance.fee) : 0;
}

export async function applyPaidMemberCreditPurchaseFromSession(
  session: Stripe.Checkout.Session,
  options: { expectedMemberId?: string; stripe?: Stripe } = {},
): Promise<boolean> {
  if (session.metadata?.type !== 'member_credit_purchase') return false;
  if (session.payment_status !== 'paid') return false;

  const purchaseId = session.metadata.purchaseId;
  if (!purchaseId) return false;

  const purchase = await db.memberCreditPurchase.findUnique({ where: { id: purchaseId } });
  if (!purchase || purchase.status === 'paid') return false;
  if (options.expectedMemberId && purchase.memberId !== options.expectedMemberId) return false;
  if (purchase.stripeSessionId && purchase.stripeSessionId !== session.id) return false;

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;
  const stripeFeeCents = await getStripeFeeCents(options.stripe, session);
  const netModelRevenueCents = Math.max(0, purchase.amountCents - purchase.platformFeeCents - stripeFeeCents);

  return db.$transaction(async (tx) => {
    const result = await tx.memberCreditPurchase.updateMany({
      where: { id: purchase.id, status: { not: 'paid' } },
      data: {
        status: 'paid',
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        stripeFeeCents,
        modelRevenueCents: netModelRevenueCents,
        paidAt: new Date(),
      },
    });

    if (result.count === 0) return false;

    await tx.member.update({
      where: { id: purchase.memberId },
      data: { remainingCredit: { increment: purchase.seconds } },
    });

    return true;
  });
}
