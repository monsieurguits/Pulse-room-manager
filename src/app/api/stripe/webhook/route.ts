import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook non configuré.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature Stripe manquante.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  if (event.type === 'account.updated') {
    await handleAccountUpdated(event.data.object as Stripe.Account);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.metadata?.type !== 'member_credit_purchase') return;

  const purchaseId = session.metadata.purchaseId;
  if (!purchaseId || session.payment_status !== 'paid') return;

  const purchase = await db.memberCreditPurchase.findUnique({ where: { id: purchaseId } });
  if (!purchase || purchase.status === 'paid') return;

  await db.$transaction([
    db.member.update({
      where: { id: purchase.memberId },
      data: { remainingCredit: { increment: purchase.seconds } },
    }),
    db.memberCreditPurchase.update({
      where: { id: purchase.id },
      data: {
        status: 'paid',
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
        paidAt: new Date(),
      },
    }),
  ]);
}

async function handleAccountUpdated(account: Stripe.Account) {
  const adminId = account.metadata?.adminId;
  if (!adminId) return;

  await db.adminUser.updateMany({
    where: { id: adminId, stripeConnectAccountId: account.id },
    data: {
      stripeConnectOnboardingComplete: Boolean(account.details_submitted && account.charges_enabled && account.payouts_enabled),
    },
  });
}
