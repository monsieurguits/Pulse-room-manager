import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { createStripeConnectUrl, getStripeErrorCode } from '@/lib/stripe-connect-link';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  const origin = request.nextUrl.origin;

  if (!admin) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  try {
    const url = await createStripeConnectUrl(admin.id);
    return NextResponse.redirect(url);
  } catch (error) {
    const detail = error instanceof Error && error.message === 'stripe_missing' ? 'stripe_missing' : getStripeErrorCode(error);
    const redirectUrl = new URL('/dashboard/account', origin);
    redirectUrl.searchParams.set('stripe', detail === 'stripe_missing' ? 'missing' : 'connect_error');
    if (detail !== 'stripe_missing') {
      redirectUrl.searchParams.set('stripe_error', detail);
    }
    return NextResponse.redirect(redirectUrl);
  }
}
