import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { applyPaidMemberCreditPurchaseFromSession } from '@/lib/member-credit-purchases';
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
    await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
  }

  if (event.type === 'account.updated') {
    await handleAccountUpdated(event.data.object as Stripe.Account);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription') {
    await handleModelSubscriptionCheckout(stripe, session);
    return;
  }

  if (session.metadata?.type !== 'member_credit_purchase') return;
  await applyPaidMemberCreditPurchaseFromSession(session, { stripe });
}

async function handleModelSubscriptionCheckout(stripe: Stripe, session: Stripe.Checkout.Session) {
  const adminId = session.metadata?.adminId;
  const plan = session.metadata?.plan;

  if (!adminId || !plan || !['starter', 'pro', 'premium'].includes(plan) || session.payment_status !== 'paid') return;

  const subscription = typeof session.subscription === 'string'
    ? await stripe.subscriptions.retrieve(session.subscription)
    : session.subscription;
  const subscriptionPeriod = subscription as { current_period_start?: number; current_period_end?: number } | null;
  const periodStart = typeof subscriptionPeriod?.current_period_start === 'number'
    ? new Date(subscriptionPeriod.current_period_start * 1000)
    : new Date();
  const periodEnd = typeof subscriptionPeriod?.current_period_end === 'number'
    ? new Date(subscriptionPeriod.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.adminUser.updateMany({
    where: { id: adminId, role: 'MODEL' },
    data: {
      subscriptionPlan: plan,
      subscriptionStartedAt: periodStart,
      subscriptionEndsAt: periodEnd,
    },
  });
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
