import Link from 'next/link';
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CircleHelp,
  Crown,
  FileText,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  MonitorPlay,
  ShieldCheck,
  UserRound,
  Vibrate,
} from 'lucide-react';
import { AccountPasswordForm } from '@/components/account-password-form';
import { OverlayLinkCard } from '@/components/overlay-link-card';
import { LEGAL_TERMS_VERSION, memberOwnerWhere, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { ensureOverlayToken } from '@/lib/overlay';
import { logoutAllAdminSessions } from '@/server-actions/auth';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Non disponible';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatDateOnly(date: Date | null | undefined) {
  if (!date) return 'Non disponible';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date);
}

function getSubscriptionLabel(plan: string | null | undefined) {
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

export default async function AccountPage() {
  const admin = await requireAdmin();
  const overlayToken = await ensureOverlayToken(admin.id);

  const [user, totalMembers, connectedMembers, pairedMembers, activeSessions, openSessions] = await Promise.all([
    db.adminUser.findUnique({ where: { id: admin.id } }),
    db.member.count({ where: memberOwnerWhere(admin) }),
    db.member.count({ where: { ...memberOwnerWhere(admin), connected: true } }),
    db.member.count({ where: { ...memberOwnerWhere(admin), lovenseUserId: { not: null } } }),
    db.adminSession.count({ where: { userId: admin.id, expiresAt: { gt: new Date() } } }),
    db.session.count({ where: admin.role === 'OWNER' ? { active: true } : { active: true, member: { ownerId: admin.id } } }),
  ]);

  const legalAccepted = admin.role !== 'MODEL' || admin.legalAcceptedVersion === LEGAL_TERMS_VERSION;
  const displayedSubscriptionPlan = admin.subscriptionPlan ?? (admin.legalAcceptedAt ? 'trial' : null);
  const displayedSubscriptionStart = admin.subscriptionStartedAt ?? admin.legalAcceptedAt;
  const displayedSubscriptionEnd = admin.subscriptionEndsAt ?? addOneMonth(admin.legalAcceptedAt);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">Espace personnel</p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-50">Compte</h1>
        <p className="mt-1 text-sm text-neutral-400">Gérez votre profil, votre sécurité et vos documents PULSEROOM.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard icon={UserRound} label="Statut du compte" value={admin.active ? 'Actif' : 'Suspendu'} />
        <SummaryCard icon={ShieldCheck} label="Sessions admin ouvertes" value={String(activeSessions)} />
        <SummaryCard icon={Vibrate} label="Membres Lovense connectés" value={`${connectedMembers}/${totalMembers}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
              <UserRound size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Profil</h2>
              <p className="text-xs text-neutral-500">Informations principales du compte.</p>
            </div>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <InfoItem label="Nom" value={admin.name} />
            <InfoItem label="Email" value={admin.email} />
            <InfoItem label="Rôle" value={admin.role === 'OWNER' ? 'Propriétaire' : 'Modèle'} />
            <InfoItem label="Compte créé le" value={formatDate(user?.createdAt)} />
            <InfoItem label="Dernière mise à jour" value={formatDate(user?.updatedAt)} />
            <InfoItem label="Version légale actuelle" value={LEGAL_TERMS_VERSION} />
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Documents légaux</h2>
              <p className="text-xs text-neutral-500">Suivi de l’acceptation et accès aux ressources.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-base-800 bg-base-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-400">CGU / RGPD</span>
                <span
                  className={
                    legalAccepted
                      ? 'rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300'
                      : 'rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300'
                  }
                >
                  {legalAccepted ? 'Acceptées' : 'À accepter'}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-300">
                {admin.role === 'MODEL'
                  ? `Acceptées le : ${formatDate(admin.legalAcceptedAt)}`
                  : 'Le propriétaire n’est pas soumis au parcours obligatoire modèle.'}
              </p>
              <p className="mt-1 text-xs text-neutral-500">Version acceptée : {admin.legalAcceptedVersion ?? 'Non disponible'}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link href="/legal" className="btn-secondary justify-center">
                <BookOpen size={17} />
                Relire les conditions
              </Link>
              <a href="/guide-modeles-pulseroom.pdf" className="btn-secondary justify-center" target="_blank" rel="noreferrer">
                <FileText size={17} />
                Guide modèle PDF
              </a>
              <a href="/manuel-complet-pulseroom.pdf" className="btn-secondary justify-center" target="_blank" rel="noreferrer">
                <FileText size={17} />
                Manuel complet PDF
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <KeyRound size={17} className="text-accent-400" />
            <h2 className="text-sm font-semibold text-neutral-200">Sécurité</h2>
          </div>
          <AccountPasswordForm />
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
              <LockKeyhole size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Accès et sessions</h2>
              <p className="text-xs text-neutral-500">Gardez le contrôle sur votre compte admin.</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-neutral-400">
            <p>Ne partagez jamais votre mot de passe administrateur avec un membre ou un tiers.</p>
            <p>Si vous pensez que votre accès a été partagé, changez votre mot de passe puis fermez toutes les sessions.</p>
            <form action={logoutAllAdminSessions}>
              <button type="submit" className="btn-secondary w-full justify-center">
                Déconnecter tous les appareils
              </button>
            </form>
          </div>
        </section>
      </div>

      {admin.role === 'MODEL' ? (
        <section className="card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
              <Crown size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Abonnement</h2>
              <p className="text-xs text-neutral-500">Offre actuellement associée à votre espace modèle.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoItem label="Offre en cours" value={getSubscriptionLabel(displayedSubscriptionPlan)} />
            <InfoItem label="Date de début" value={formatDateOnly(displayedSubscriptionStart)} />
            <InfoItem label="Date de fin" value={formatDateOnly(displayedSubscriptionEnd)} />
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-base-800 bg-base-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-neutral-400">
              Chaque période affichée couvre un mois. Vous pouvez consulter les offres si vous souhaitez changer de plan.
            </p>
            <Link href="/subscription" className="btn-accent shrink-0 justify-center">
              Changer de plan
            </Link>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <MonitorPlay size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Overlay OBS</h2>
              <p className="text-xs text-neutral-500">Annonce automatiquement les prises de contrôle pendant le live.</p>
            </div>
          </div>

          <OverlayLinkCard token={overlayToken} />
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            Dans OBS, ajoutez une source navigateur, collez cette URL, puis utilisez un fond transparent.
          </p>
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <Vibrate size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Résumé Lovense</h2>
              <p className="text-xs text-neutral-500">Vue rapide de vos connexions appareils.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Membres" value={String(totalMembers)} />
            <Metric label="Appairés" value={String(pairedMembers)} />
            <Metric label="Connectés" value={String(connectedMembers)} />
          </div>
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            Les jouets se connectent depuis la fiche d’un membre. Chaque lien membre contrôle uniquement l’appareil associé à ce
            membre.
          </p>
          <p className="mt-2 text-xs text-neutral-500">Sessions de contrôle actives : {openSessions}</p>
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
              <LifeBuoy size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Support</h2>
              <p className="text-xs text-neutral-500">
                Les informations sont à fournir en cas de problème à l’adresse email : monsieurguits@gmail.com
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-neutral-400">
            <SupportItem icon={CircleHelp} text="Nom ou pseudo du membre concerné." />
            <SupportItem icon={CalendarDays} text="Date, heure et action testée." />
            <SupportItem icon={BadgeCheck} text="Message d’erreur exact ou capture d’écran." />
            <SupportItem icon={Vibrate} text="Statut Lovense affiché : connecté ou déconnecté." />
          </div>
        </section>
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
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="mt-1 text-lg font-bold text-neutral-50">{value}</p>
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

function SupportItem({ icon: Icon, text }: { icon: typeof CircleHelp; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-base-800 bg-base-950/70 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
      <span>{text}</span>
    </div>
  );
}
