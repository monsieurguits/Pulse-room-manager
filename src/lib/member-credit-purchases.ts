import Stripe from 'stripe';
import { db } from '@/lib/db';

export async function applyPaidMemberCreditPurchaseFromSession(
  session: Stripe.Checkout.Session,
  options: { expectedMemberId?: string } = {},
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

  return db.$transaction(async (tx) => {
    const result = await tx.memberCreditPurchase.updateMany({
      where: { id: purchase.id, status: { not: 'paid' } },
      data: {
        status: 'paid',
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
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
