import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BadgeCheck, Crown, Radio, ShieldCheck, Sparkles, Star, Users, Zap } from 'lucide-react';
import { hasAcceptedCurrentLegalTerms, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '29 €',
    subtitle: 'Pour démarrer avec une première base de membres.',
    icon: Star,
    accent: 'from-cyan-400 to-accent-400',
    border: 'border-cyan-400/35',
    badge: 'Essentiel',
    features: [
      'Espace modèle personnel',
      'Gestion des membres fanclub',
      'Liens de contrôle sécurisés',
      'Connexion Lovense par QR code',
      'Crédit hebdomadaire automatique',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '49 €',
    subtitle: 'L’offre recommandée pour les modèles actives en live.',
    icon: Crown,
    accent: 'from-accent-500 to-fuchsia-400',
    border: 'border-accent-400/50',
    badge: 'Recommandé',
    highlighted: true,
    features: [
      'Tout le plan Starter',
      'Overlay OBS PULSEROOM',
      'Tips mis en attente pendant un contrôle',
      'Guide PDF modèle et manuel complet',
      'Support prioritaire par email',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '79 €',
    subtitle: 'Pour les modèles qui veulent un accompagnement complet.',
    icon: Sparkles,
    accent: 'from-violet-400 to-cyan-300',
    border: 'border-violet-400/45',
    badge: 'Complet',
    features: [
      'Tout le plan Pro',
      'Aide à la configuration OBS',
      'Accompagnement Lovense',
      'Optimisation des offres membres',
      'Priorité sur les nouvelles fonctions',
    ],
  },
];

export default async function SubscriptionPage() {
  const admin = await requireAdmin();

  if (admin.role !== 'MODEL' || hasAcceptedCurrentLegalTerms(admin)) {
    redirect('/dashboard');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050509] px-4 py-8 text-neutral-100 sm:px-6 lg:px-8">
      <div className="login-animated-gradient absolute inset-0" />
      <div className="login-ambient-glow absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(5,5,9,0.18)_0%,rgba(5,5,9,0.74)_42%,rgba(5,5,9,0.96)_100%)] opacity-90" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-base-950 via-base-950/82 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-center gap-8">
        <header className="mx-auto max-w-3xl text-center">
          <img src="/pulseroom-logo-transparent.png" alt="PULSEROOM" className="mx-auto h-32 w-32 object-contain sm:h-40 sm:w-40" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Première connexion modèle</p>
          <h1 className="mt-3 text-balance text-3xl font-black text-neutral-50 sm:text-5xl">Choisissez votre abonnement</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            Sélectionnez l’offre qui correspond à votre activité. Cette étape prépare votre espace avant la validation
            des documents légaux PULSEROOM.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex min-h-full flex-col rounded-2xl border ${plan.border} bg-[rgba(5,5,9,0.58)] p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl ${
                plan.highlighted ? 'ring-1 ring-accent-300/50 lg:-translate-y-2' : ''
              }`}
            >
              <div className={`absolute inset-x-5 top-0 h-1 rounded-b-full bg-gradient-to-r ${plan.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <plan.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`rounded-full bg-gradient-to-r ${plan.accent} px-3 py-1 text-xs font-bold text-white`}>
                  {plan.badge}
                </span>
              </div>

              <div className="mt-5">
                <h2 className="text-2xl font-black text-neutral-50">{plan.name}</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-400">{plan.subtitle}</p>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-base-950/60 p-4">
                <span className="text-4xl font-black text-neutral-50">{plan.price}</span>
                <span className="ml-2 text-sm text-neutral-500">/ mois</span>
              </div>

              <ul className="mt-5 flex flex-1 flex-col gap-3 text-sm text-neutral-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={`/legal/accept?plan=${plan.id}`} className={plan.highlighted ? 'btn-accent mt-6 w-full' : 'btn-secondary mt-6 w-full'}>
                <Zap size={17} />
                S’abonner
              </Link>
            </article>
          ))}
        </section>

        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-white/12 bg-[rgba(5,5,9,0.46)] p-5 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent-300" />
              Sans engagement pendant la période d’essai
            </span>
            <span className="inline-flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-300" />
              Compatible Lovense et OBS
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-300" />
              Pensé pour les modèles indépendantes
            </span>
          </div>

          <Link href="/legal/accept?trial=30" className="btn-accent min-h-12 w-full max-w-sm">
            Essai gratuit de 30 jours
          </Link>
        </section>
      </div>
    </main>
  );
}
