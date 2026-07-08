import { redirect } from 'next/navigation';
import { applyStripeCheckoutSession } from '@/server-actions/subscription';

export const dynamic = 'force-dynamic';

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{
    session_id?: string;
  }>;
}) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  if (!sessionId) {
    redirect('/dashboard/account');
  }

  await applyStripeCheckoutSession(sessionId);
  redirect('/dashboard/account?subscription=updated');
}
