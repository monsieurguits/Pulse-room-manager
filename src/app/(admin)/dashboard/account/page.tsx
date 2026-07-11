import Link from 'next/link';
import {
  BadgeEuro,
  CalendarDays,
  CreditCard,
  Crown,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
  Vibrate,
} from 'lucide-react';
import { AccountPasswordForm } from '@/components/account-password-form';
import { AccountProfileForm } from '@/components/account-profile-form';
import { WeatherCityForm } from '@/components/weather-city-form';
import { formatEuros } from '@/lib/credit-packs';
import { LEGAL_TERMS_VERSION, memberOwnerWhere, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { syncStripeConnectAccountStatus } from '@/lib/stripe-connect-status';
import { logoutAllAdminSessions } from '@/server-actions/auth';
import { createStripeConnectAccountLink } from '@/server-actions/stripe-connect';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Non disponible';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatDateOnly(date: Date | null | undefined) {
  if (!date) return 'Non disponible';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date);
}

function formatDateInput(date: Date | null | undefined) {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

function getSubscriptionLabel(plan: string | null | undefined, role: string) {
  if (role === 'OWNER') return 'Propriétaire';
  switch (plan) {
    case 'starter':
      return 'Starter';
    case 'pro':
      return 'Pro';
    case 'premium':
      return 'Premium';
    case 'trial':
      return 'Essai gratuit 30 jours';
    default:
      return 'Non sélectionné';
  }
}

function addOneMonth(date: Date | null | undefined) {
  if (!date) return null;
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}

function getStripeNotice(stripeStatus: string | undefined, stripeError: string | undefined) {
  switch (stripeStatus) {
    case 'missing':
      return {
        tone: 'error',
        text: 'Stripe n’est pas configuré. Ajoutez STRIPE_SECRET_KEY dans les variables Vercel puis redéployez.',
      };
    case 'connect_error':
      return {
        tone: 'error',
        text: `Stripe Connect n’a pas pu générer le lien. Vérifiez que Connect est activé dans Stripe et que la clé STRIPE_SECRET_KEY correspond au bon mode test/live.${stripeError ? ` Détail Stripe : ${stripeError}.` : ''}`,
      };
    case 'refresh':
      return {
        tone: 'warning',
        text: 'Le lien Stripe a expiré ou a déjà été utilisé. Cliquez à nouveau sur le bouton pour générer un nouveau lien sécurisé.',
      };
    case 'connected':
      return {
        tone: 'success',
        text: 'Retour Stripe effectué. Si la validation indique encore “À finaliser”, terminez les informations demandées par Stripe.',
      };
    default:
      return null;
  }
}

export default async function AccountPage({ searchParams }: { searchParams?: Promise<{ stripe?: string; stripe_error?: string }> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const stripeNotice = getStripeNotice(params?.stripe, params?.stripe_error);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    user,
    totalMembers,
    connectedMembers,
    activeAdminSessions,
    openControlSessions,
    monthlyCreditRevenue,
    recentCreditPurchases,
  ] = await Promise.all([
    db.adminUser.findUnique({ where: { id: admin.id } }),
    db.member.count({ where: memberOwnerWhere(admin) }),
    db.member.count({ where: { ...memberOwnerWhere(admin), connected: true } }),
    db.adminSession.count({ where: { userId: admin.id, expiresAt: { gt: new Date() } } }),
    db.session.count({ where: admin.role === 'OWNER' ? { active: true } : { active: true, member: { ownerId: admin.id } } }),
    db.memberCreditPurchase.aggregate({
      where: {
        ...(admin.role === 'OWNER' ? {} : { ownerId: admin.id }),
        status: 'paid',
        paidAt: { gte: monthStart },
      },
      _sum: { modelRevenueCents: true, amountCents: true, platformFeeCents: true },
    }),
    db.memberCreditPurchase.findMany({
      where: {
        ...(admin.role === 'OWNER' ? {} : { ownerId: admin.id }),
        status: 'paid',
      },
      include: { member: { select: { username: true } } },
      orderBy: { paidAt: 'desc' },
      take: 6,
    }),
  ]);

  if (!user) {
    throw new Error('Compte introuvable.');
  }

  const displayedSubscriptionPlan = user.subscriptionPlan ?? (user.legalAcceptedAt ? 'trial' : null);
  const displayedSubscriptionStart = user.subscriptionStartedAt ?? user.legalAcceptedAt;
  const displayedSubscriptionEnd = user.subscriptionEndsAt ?? addOneMonth(user.legalAcceptedAt);
  const creditRevenueCents =
    admin.role === 'OWNER'
      ? monthlyCreditRevenue._sum.platformFeeCents ?? 0
      : monthlyCreditRevenue._sum.modelRevenueCents ?? 0;
  const stripeConnectOnboardingComplete =
    user.role === 'MODEL' && user.stripeConnectAccountId
      ? await syncStripeConnectAccountStatus(user.id, user.stripeConnectAccountId).catch(
          () => user.stripeConnectOnboardingComplete,
        )
      : user.stripeConnectOnboardingComplete;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">Espace personnel</p>
          <h1 className="mt-2 text-2xl font-bold text-neutral-50">Compte</h1>
          <p className="mt-1 text-sm text-neutral-400">Profil, sécurité, météo, accès et abonnement.</p>
        </div>
        <Link href="/dashboard/technical" className="btn-secondary w-full justify-center sm:w-auto">
          Espace technique
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={ShieldCheck} label="Statut du compte" value={user.active ? 'Actif' : 'Suspendu'} />
        <SummaryCard icon={LockKeyhole} label="Sessions admin ouvertes" value={String(activeAdminSessions)} />
        <SummaryCard icon={Vibrate} label="Membres Lovense connectés" value={`${connectedMembers}/${totalMembers}`} />
        <SummaryCard icon={BadgeEuro} label="Revenu crédits ce mois" value={formatEuros(creditRevenueCents)} />
      </div>

      <section className="card p-5">
        <SectionHeader
          icon={UserRound}
          title="Informations du compte"
          description="Informations visibles et administratives du modèle ou de l’admin."
        />
        <AccountProfileForm
          defaultValues={{
            name: user.name,
            firstName: user.firstName,
            gender: user.gender,
            birthDate: formatDateInput(user.birthDate),
          }}
        />

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Rôle" value={user.role === 'OWNER' ? 'Propriétaire' : 'Modèle'} />
          <InfoItem label="Sexe" value={user.gender ?? 'Non renseigné'} />
          <InfoItem label="Date de naissance" value={formatDateOnly(user.birthDate)} />
          <InfoItem label="Compte créé le" value={formatDate(user.createdAt)} />
          <InfoItem label="Dernière mise à jour" value={formatDate(user.updatedAt)} />
          <InfoItem label="Ville météo" value={user.weatherCity ?? 'Non configurée'} />
          <InfoItem label="Version légale actuelle" value={LEGAL_TERMS_VERSION} />
          <InfoItem label="Version acceptée" value={user.legalAcceptedVersion ?? 'Non disponible'} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <KeyRound size={17} className="text-accent-400" />
            <h2 className="text-sm font-semibold text-neutral-200">Sécurité</h2>
          </div>
          <AccountPasswordForm />
        </section>

        <section className="card p-5">
          <SectionHeader
            icon={LockKeyhole}
            title="Accès et sessions"
            description="Gestion des connexions ouvertes sur votre compte."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Sessions admin ouvertes" value={String(activeAdminSessions)} />
            <InfoItem label="Sessions de contrôle actives" value={String(openControlSessions)} />
          </div>
          <div className="mt-4 space-y-4 text-sm text-neutral-400">
            <p>Si vous pensez que votre accès a été partagé, changez votre mot de passe puis fermez toutes les sessions.</p>
            <form action={logoutAllAdminSessions}>
              <button type="submit" className="btn-secondary w-full justify-center">
                Déconnecter tous les appareils
              </button>
            </form>
          </div>
        </section>
      </div>

      <section className="card p-5">
        <SectionHeader
          icon={MapPin}
          title="Tableau de bord météo"
          description="Ville utilisée pour afficher la température sur le tableau de bord et les pages membres."
        />
        <WeatherCityForm defaultValue={user.weatherCity} />
      </section>

      <section className="card p-5">
        <SectionHeader icon={Crown} title="Abonnement" description="Offre actuellement associée à votre espace." />
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoItem label="Offre en cours" value={getSubscriptionLabel(displayedSubscriptionPlan, user.role)} />
          <InfoItem label="Date de début" value={formatDateOnly(displayedSubscriptionStart)} />
          <InfoItem label="Date de fin" value={formatDateOnly(displayedSubscriptionEnd)} />
        </div>
        {user.role === 'MODEL' ? (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-base-800 bg-base-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-neutral-400">
              Chaque période affichée couvre un mois. Vous pouvez consulter les offres si vous souhaitez changer de plan.
            </p>
            <Link href="/subscription" className="btn-accent shrink-0 justify-center">
              Changer de plan
            </Link>
          </div>
        ) : null}
      </section>

      <section className="card p-5">
        <SectionHeader
          icon={CreditCard}
          title="Paiements et revenus crédits"
          description="Stripe Connect permet au modèle de recevoir ses revenus avec commission plateforme."
        />
        {stripeNotice ? (
          <p
            className={`mb-5 rounded-2xl border p-4 text-sm leading-6 ${
              stripeNotice.tone === 'success'
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
                : stripeNotice.tone === 'warning'
                  ? 'border-amber-500/25 bg-amber-500/10 text-amber-200'
                  : 'border-red-500/25 bg-red-500/10 text-red-200'
            }`}
          >
            {stripeNotice.text}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoItem label="Compte Stripe" value={user.stripeConnectAccountId ? 'Connecté' : 'Non connecté'} />
          <InfoItem label="Validation Stripe" value={stripeConnectOnboardingComplete ? 'Terminée' : 'À finaliser'} />
          <InfoItem label="Revenu du mois" value={formatEuros(creditRevenueCents)} />
        </div>
        {user.role === 'MODEL' ? (
          <form action={createStripeConnectAccountLink} className="mt-5">
            <button type="submit" className="btn-accent w-full justify-center sm:w-auto">
              <CreditCard size={17} />
              {user.stripeConnectAccountId ? 'Gérer mon compte Stripe' : 'Connecter Stripe'}
            </button>
          </form>
        ) : null}
        <div className="mt-5 rounded-2xl border border-base-800 bg-base-950/70 p-4">
          <h3 className="text-sm font-semibold text-neutral-200">Derniers achats de crédits</h3>
          {recentCreditPurchases.length > 0 ? (
            <div className="mt-3 space-y-3">
              {recentCreditPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between gap-3 border-t border-base-800 pt-3 text-sm first:border-t-0 first:pt-0">
                  <div>
                    <p className="font-medium text-neutral-100">{purchase.member.username}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{purchase.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-100">
                      {formatEuros(admin.role === 'OWNER' ? purchase.platformFeeCents : purchase.modelRevenueCents)}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">Achat {formatEuros(purchase.amountCents)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">Aucun achat de crédit payé pour le moment.</p>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <SectionHeader icon={Users} title="Membres et Lovense" description="Vue rapide des membres rattachés au compte." />
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Membres" value={String(totalMembers)} />
            <Metric label="Connectés" value={String(connectedMembers)} />
            <Metric label="Sessions actives" value={String(openControlSessions)} />
          </div>
        </section>

        <section className="card p-5">
          <SectionHeader icon={LifeBuoy} title="Support" description="Contact support officiel PULSEROOM." />
          <div className="rounded-2xl border border-base-800 bg-base-950/70 p-4 text-sm leading-6 text-neutral-300">
            Pour toute demande, contactez <span className="font-semibold text-neutral-50">contact@pulse-room.app</span> avec votre
            pseudo, l’heure du problème et une capture du message affiché.
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
        <Icon size={21} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="mt-1 truncate text-lg font-bold text-neutral-50">{value}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-950/70 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 break-words font-medium text-neutral-100">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-950/70 p-4 text-center">
      <p className="text-2xl font-bold text-neutral-50">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </div>
  );
}
