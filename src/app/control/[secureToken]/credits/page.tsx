import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeEuro, Clock3, CreditCard, Sparkles } from 'lucide-react';
import { CREDIT_PACKS, formatEuros } from '@/lib/credit-packs';
import { db } from '@/lib/db';
import { formatDuration } from '@/lib/utils';
import { createMemberCreditCheckoutSession } from '@/server-actions/credits';

export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default async function MemberCreditsPage({
  params,
  searchParams,
}: {
  params: Promise<{ secureToken: string }>;
  searchParams: Promise<{ payment?: string; error?: string }>;
}) {
  const { secureToken } = await params;
  const query = await searchParams;

  const member = await db.member.findUnique({
    where: { secureToken },
    include: {
      owner: { select: { name: true, stripeConnectOnboardingComplete: true } },
      creditPurchases: {
        where: { status: 'paid' },
        orderBy: { paidAt: 'desc' },
        take: 8,
      },
    },
  });

  if (!member) notFound();
  const stripeReady = Boolean(member.owner?.stripeConnectOnboardingComplete);

  return (
    <main className="min-h-screen bg-base-950 px-4 py-6 text-neutral-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href={`/control/${secureToken}`} className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
              <ArrowLeft size={16} />
              Retour au contrôle
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">Crédits FanClub</p>
            <h1 className="mt-2 text-3xl font-black text-neutral-50">Acheter des crédits</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Solde actuel de {member.username} :{' '}
              <span className="font-semibold text-neutral-100">{formatDuration(member.remainingCredit)}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-base-800 bg-base-900 px-4 py-3 text-sm text-neutral-300">
            Modèle : <span className="font-semibold text-neutral-50">{member.owner?.name ?? 'PULSEROOM'}</span>
          </div>
        </div>

        {query.payment === 'cancelled' ? (
          <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-200">
            Paiement annulé. Aucun crédit n’a été ajouté.
          </p>
        ) : null}

        {query.error ? (
          <p className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
            {query.error === 'stripe_connect_required'
              ? 'Le modèle doit finaliser son compte Stripe avant de pouvoir recevoir des achats de crédits.'
              : 'Paiement indisponible pour le moment. Réessayez dans quelques instants.'}
          </p>
        ) : null}

        {!stripeReady ? (
          <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            Les achats de crédits seront disponibles dès que le modèle aura terminé la validation de son compte Stripe.
          </p>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <form
              key={pack.id}
              action={createMemberCreditCheckoutSession}
              className={`relative rounded-2xl border p-5 shadow-xl ${
                pack.popular
                  ? 'border-accent-400/50 bg-accent-500/10 shadow-accent-950/30'
                  : 'border-base-800 bg-base-900'
              }`}
            >
              <input type="hidden" name="secureToken" value={secureToken} />
              <input type="hidden" name="packId" value={pack.id} />
              {pack.popular ? (
                <span className="absolute right-4 top-4 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white">
                  Populaire
                </span>
              ) : null}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent-300">
                <Clock3 size={20} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-neutral-50">{pack.label}</h2>
              <p className="mt-1 text-sm text-neutral-400">Crédit supplémentaire immédiat après paiement.</p>
              <p className="mt-5 text-3xl font-black text-neutral-50">{formatEuros(pack.amountCents)}</p>
              <button
                type="submit"
                disabled={!stripeReady}
                className={pack.popular ? 'btn-accent mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50' : 'btn-secondary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50'}
              >
                <CreditCard size={17} />
                {stripeReady ? 'Acheter' : 'Indisponible'}
              </button>
            </form>
          ))}
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <BadgeEuro size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Historique des achats</h2>
              <p className="text-xs text-neutral-500">Les paiements réussis ajoutent automatiquement le crédit au solde.</p>
            </div>
          </div>

          {member.creditPurchases.length > 0 ? (
            <div className="space-y-3">
              {member.creditPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between gap-3 rounded-2xl border border-base-800 bg-base-950/70 p-4 text-sm">
                  <div>
                    <p className="font-semibold text-neutral-100">{purchase.label}</p>
                    <p className="mt-1 text-xs text-neutral-500">{purchase.paidAt ? formatDate(purchase.paidAt) : formatDate(purchase.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-100">{formatEuros(purchase.amountCents)}</p>
                    <p className="mt-1 text-xs text-emerald-300">+{formatDuration(purchase.seconds)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-base-800 bg-base-950/70 p-4 text-sm text-neutral-400">
              Aucun achat de crédit pour le moment.
            </div>
          )}
        </section>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-neutral-400">
          <Sparkles className="mb-2 h-4 w-4 text-accent-300" />
          Le crédit acheté s’ajoute à votre solde existant et peut être utilisé pendant les sessions autorisées par le modèle.
        </div>
      </div>
    </main>
  );
}
