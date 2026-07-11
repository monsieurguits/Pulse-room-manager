'use server';

import { redirect } from 'next/navigation';
import { getCreditPack } from '@/lib/credit-packs';
import { db } from '@/lib/db';
import { getAppUrl, getPlatformCommissionRate, getStripe } from '@/lib/stripe';

export async function createMemberCreditCheckoutSession(formData: FormData): Promise<void> {
  const secureToken = String(formData.get('secureToken') ?? '');
  const packId = String(formData.get('packId') ?? '');
  const pack = getCreditPack(packId);
  const stripe = getStripe();

  if (!pack || !secureToken || !stripe) {
    redirect(`/control/${secureToken}/credits?error=stripe_config`);
  }

  const member = await db.member.findUnique({
    where: { secureToken },
    include: { owner: true },
  });

  if (!member || !member.active) {
    redirect(`/control/${secureToken}/credits?error=member_unavailable`);
  }

  const appUrl = getAppUrl();
  const platformFeeCents = Math.round(pack.amountCents * getPlatformCommissionRate());
  const modelRevenueCents = Math.max(0, pack.amountCents - platformFeeCents);
  const ownerStripeAccountId = member.owner?.stripeConnectOnboardingComplete
    ? member.owner.stripeConnectAccountId
    : null;

  if (!ownerStripeAccountId) {
    redirect(`/control/${secureToken}/credits?error=stripe_connect_required`);
  }

  const purchase = await db.memberCreditPurchase.create({
    data: {
      memberId: member.id,
      ownerId: member.ownerId,
      packId: pack.id,
      label: pack.label,
      seconds: pack.seconds,
      amountCents: pack.amountCents,
      platformFeeCents,
      modelRevenueCents,
      stripeConnectAccountId: ownerStripeAccountId,
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Crédits PULSEROOM - ${pack.label}`,
            description: `${pack.minutes} minutes de contrôle supplémentaires pour ${member.username}`,
          },
          unit_amount: pack.amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'member_credit_purchase',
      purchaseId: purchase.id,
      memberId: member.id,
      ownerId: member.ownerId ?? '',
      packId: pack.id,
      seconds: String(pack.seconds),
    },
    payment_intent_data: ownerStripeAccountId
      ? {
          application_fee_amount: platformFeeCents,
          transfer_data: {
            destination: ownerStripeAccountId,
          },
        }
      : undefined,
    success_url: `${appUrl}/control/${secureToken}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/control/${secureToken}/credits?payment=cancelled`,
  });

  await db.memberCreditPurchase.update({
    where: { id: purchase.id },
    data: { stripeSessionId: session.id },
  });

  if (!session.url) {
    redirect(`/control/${secureToken}/credits?error=stripe_session`);
  }

  redirect(session.url);
}
