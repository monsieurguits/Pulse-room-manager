import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDuration } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CreditSuccessPage({
  params,
}: {
  params: Promise<{ secureToken: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { secureToken } = await params;

  const member = await db.member.findUnique({ where: { secureToken } });
  if (!member) redirect('/join');

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-950 px-4 py-10 text-neutral-100">
      <section className="card w-full max-w-md p-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-neutral-50">Paiement confirmé</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          Stripe confirme votre paiement. Le crédit est ajouté automatiquement au solde dès réception du webhook.
        </p>
        <p className="mt-4 rounded-2xl border border-base-800 bg-base-950/70 p-4 text-sm text-neutral-300">
          Solde actuel : <span className="font-semibold text-neutral-50">{formatDuration(member.remainingCredit)}</span>
        </p>
        <Link href={`/control/${secureToken}`} className="btn-accent mt-5 w-full justify-center">
          Retour au contrôle
        </Link>
      </section>
    </main>
  );
}
