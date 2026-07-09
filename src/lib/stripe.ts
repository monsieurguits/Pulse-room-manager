import Stripe from 'stripe';

export function getAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_DOMAIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://pulse-room.app';

  return raw.replace(/\/$/, '');
}

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  return new Stripe(secretKey);
}

export function getPlatformCommissionRate(): number {
  const value = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 20);
  if (!Number.isFinite(value)) return 0.2;
  return Math.min(0.8, Math.max(0, value / 100));
}
