import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, ArrowLeft, BadgeCheck, CreditCard, LockKeyhole, ReceiptText, ShieldCheck, Sparkles } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { createStripeCheckoutSession } from '@/server-actions/subscription';

export const dynamic = 'force-dynamic';

const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: '29 €',
    description: 'Pour démarrer avec une première base de membres.',
    features: ['Espace modèle personnel', 'Gestion des membres fanclub', 'Liens de contrôle sécurisés', 'Connexion Lovense par QR code'],
    accent: 'from-cyan-400 to-accent-400',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '49 €',
    description: 'L’offre recommandée pour les modèles actives en live.',
    features: ['Tout le plan Starter', 'Overlay OBS PULSEROOM', 'Tips mis en attente pendant un contrôle', 'Support prioritaire par email'],
    accent: 'from-accent-500 to-fuchsia-400',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: '79 €',
    description: 'Pour les modèles qui veulent un accompagnement complet.',
    features: ['Tout le plan Pro', 'Aide à la configuration OBS', 'Accompagnement Lovense', 'Priorité sur les nouvelles fonctions'],
    accent: 'from-violet-400 to-cyan-300',
  },
} as const;

type PaymentPageProps = {
  searchParams?: Promise<{
    plan?: string;
    error?: string;
    payment?: string;
  }>;
};

export default async function SubscriptionPaymentPage({ searchParams }: PaymentPageProps) {
  const admin = await requireAdmin();

  if (admin.role !== 'MODEL') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const planKey = params?.plan;
  const plan = planKey && planKey in PLANS ? PLANS[planKey as keyof typeof PLANS] : null;
  const stripeError = params?.error;
  const paymentCancelled = params?.payment === 'cancelled';

  if (!plan) {
    redirect('/subscription');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050509] px-4 py-8 text-neutral-100 sm:px-6 lg:px-8">
      <div className="login-animated-gradient absolute inset-0" />
      <div className="login-ambient-glow absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(5,5,9,0.16)_0%,rgba(5,5,9,0.72)_44%,rgba(5,5,9,0.97)_100%)] opacity-95" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-base-950 via-base-950/82 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl flex-col justify-center gap-6">
        <header className="mx-auto w-full max-w-3xl text-center">
          <img src="/pulseroom-logo-transparent.png" alt="PULSEROOM" className="mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Paiement sécurisé</p>
          <h1 className="mt-3 text-balance text-3xl font-black text-neutral-50 sm:text-5xl">Finaliser l’abonnement {plan.name}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            Vérifiez votre offre avant de continuer. Le paiement sécurisé sera connecté ici dès que le compte de paiement
            PULSEROOM sera activé.
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
          <article className="rounded-3xl border border-white/12 bg-[rgba(5,5,9,0.58)] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6">
            <Link href="/subscription" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Changer d’abonnement
            </Link>

            <div className={`mt-5 h-1.5 rounded-full bg-gradient-to-r ${plan.accent}`} />

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="mt-4 text-3xl font-black text-white">{plan.name}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400">{plan.description}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-base-950/60 p-4 sm:text-right">
                <span className="text-4xl font-black text-neutral-50">{plan.price}</span>
                <span className="ml-2 text-sm text-neutral-500">/ mois</span>
                <p className="mt-1 text-xs text-neutral-500">Renouvellement mensuel</p>
              </div>
            </div>

            <ul className="mt-6 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-3xl border border-white/12 bg-[rgba(5,5,9,0.66)] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
                <CreditCard className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Paiement</h2>
                <p className="text-xs text-neutral-500">Module sécurisé en préparation</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-base-950/70 p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-neutral-400">Offre sélectionnée</span>
                <span className="font-bold text-white">{plan.name}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                <span className="text-neutral-400">Total mensuel</span>
                <span className="font-black text-white">{plan.price}</span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {stripeError ? (
                <div className="flex gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Paiement Stripe non disponible pour le moment. Vérifiez les variables Stripe dans Vercel avant de tester
                    un paiement réel.
                  </span>
                </div>
              ) : null}

              {paymentCancelled ? (
                <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>Le paiement a été annulé. Vous pouvez relancer Checkout quand vous le souhaitez.</span>
                </div>
              ) : null}

              <div className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-sm text-neutral-300">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" />
                <span>Les paiements sont traités par Stripe, sans stockage de carte bancaire sur PULSEROOM.</span>
              </div>
              <div className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-sm text-neutral-300">
                <ReceiptText className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <span>Une confirmation Stripe sera envoyée après validation du paiement.</span>
              </div>
              <div className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-sm text-neutral-300">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                <span>Vous pourrez ensuite valider les documents légaux et accéder à votre espace.</span>
              </div>
            </div>

            <form action={createStripeCheckoutSession} className="mt-6">
              <input type="hidden" name="plan" value={plan.id} />
              <button type="submit" className="btn-accent min-h-12 w-full">
                Payer avec Stripe
              </button>
            </form>
            <p className="mt-3 text-center text-xs leading-5 text-neutral-500">
              Après paiement, vous serez redirigée vers la validation des documents légaux.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
