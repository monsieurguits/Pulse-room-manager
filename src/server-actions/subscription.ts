'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { hasAcceptedCurrentLegalTerms, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER_ID,
  pro: process.env.STRIPE_PRICE_PRO_ID,
  premium: process.env.STRIPE_PRICE_PREMIUM_ID,
} as const;

function getAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_DOMAIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://pulse-room.app';

  return raw.replace(/\/$/, '');
}

function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  return new Stripe(secretKey);
}

export async function createStripeCheckoutSession(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  if (admin.role !== 'MODEL') {
    redirect('/dashboard');
  }

  const plan = String(formData.get('plan') || '');

  if (!(plan in STRIPE_PRICE_IDS)) {
    redirect('/subscription');
  }

  const priceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS];
  const stripe = getStripe();

  if (!stripe || !priceId) {
    redirect(`/subscription/payment?plan=${plan}&error=stripe_config`);
  }

  const appUrl = getAppUrl();
  const successUrl = hasAcceptedCurrentLegalTerms(admin)
    ? `${appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
    : `${appUrl}/legal/accept?plan=${plan}&checkout=success&session_id={CHECKOUT_SESSION_ID}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: admin.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    metadata: {
      adminId: admin.id,
      plan,
    },
    subscription_data: {
      metadata: {
        adminId: admin.id,
        plan,
      },
    },
    success_url: successUrl,
    cancel_url: `${appUrl}/subscription/payment?plan=${plan}&payment=cancelled`,
  });

  if (!session.url) {
    redirect(`/subscription/payment?plan=${plan}&error=stripe_session`);
  }

  redirect(session.url);
}

export async function applyStripeCheckoutSession(sessionId: string): Promise<void> {
  const admin = await requireAdmin();
  const stripe = getStripe();

  if (admin.role !== 'MODEL' || !stripe) {
    redirect('/dashboard/account');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const plan = session.metadata?.plan;
  const adminId = session.metadata?.adminId;

  if (adminId !== admin.id || !plan || !(plan in STRIPE_PRICE_IDS)) {
    redirect('/dashboard/account');
  }

  if (session.mode !== 'subscription' || session.payment_status !== 'paid') {
    redirect(`/subscription/payment?plan=${plan}&payment=cancelled`);
  }

  const subscriptionStartedAt = new Date();
  const subscriptionEndsAt = new Date(subscriptionStartedAt);
  subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

  await db.adminUser.update({
    where: { id: admin.id },
    data: {
      subscriptionPlan: plan,
      subscriptionStartedAt,
      subscriptionEndsAt,
    },
  });
}
