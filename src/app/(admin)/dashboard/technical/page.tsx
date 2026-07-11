import Link from 'next/link';
import { BadgeCheck, BookOpen, CalendarDays, CircleHelp, FileText, LifeBuoy, MonitorPlay, Vibrate } from 'lucide-react';
import { OverlayLinkCard } from '@/components/overlay-link-card';
import { LEGAL_TERMS_VERSION, memberOwnerWhere, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { ensureOverlayToken } from '@/lib/overlay';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Non disponible';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default async function TechnicalPage() {
  const admin = await requireAdmin();
  const overlayToken = await ensureOverlayToken(admin.id);

  const [totalMembers, pairedMembers, connectedMembers, openSessions] = await Promise.all([
    db.member.count({ where: memberOwnerWhere(admin) }),
    db.member.count({ where: { ...memberOwnerWhere(admin), lovenseUserId: { not: null } } }),
    db.member.count({ where: { ...memberOwnerWhere(admin), connected: true } }),
    db.session.count({ where: admin.role === 'OWNER' ? { active: true } : { active: true, member: { ownerId: admin.id } } }),
  ]);

  const legalAccepted = admin.role !== 'MODEL' || admin.legalAcceptedVersion === LEGAL_TERMS_VERSION;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">Configuration</p>
          <h1 className="mt-2 text-2xl font-bold text-neutral-50">Technique</h1>
          <p className="mt-1 text-sm text-neutral-400">Documentation, OBS, Lovense et support technique.</p>
        </div>
        <Link href="/dashboard/account" className="btn-secondary w-full justify-center sm:w-auto">
          Retour au compte
        </Link>
      </div>

      <section className="card p-5">
        <SectionHeader icon={FileText} title="Documentation légale" description="Conditions, confidentialité et version acceptée." />
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/legal" className="btn-secondary justify-center">
              <BookOpen size={17} />
              Relire les conditions
            </Link>
            <a href="/conditions-generales-pulseroom.pdf" className="btn-secondary justify-center" target="_blank" rel="noreferrer">
              <FileText size={17} />
              Conditions générales PDF
            </a>
            <a href="/guide-modeles-pulseroom.pdf" className="btn-secondary justify-center" target="_blank" rel="noreferrer">
              <FileText size={17} />
              Guides modèles PDF
            </a>
            <a href="/manuel-complet-pulseroom.pdf" className="btn-secondary justify-center" target="_blank" rel="noreferrer">
              <FileText size={17} />
              Manuel complet PDF
            </a>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <SectionHeader
            icon={MonitorPlay}
            title="Overlay OBS"
            description="Liens navigateur à ajouter dans OBS pour les annonces et la courbe de puissance."
          />
          <OverlayLinkCard token={overlayToken} />
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            Dans OBS, ajoutez une source navigateur, collez l’URL souhaitée, puis utilisez un fond transparent.
          </p>
        </section>

        <section className="card p-5">
          <SectionHeader icon={Vibrate} title="Résumé Lovense" description="Vue rapide de vos connexions appareils." />
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
      </div>

      <section className="card p-5">
        <SectionHeader icon={LifeBuoy} title="Support" description="Informations à transmettre en cas de problème." />
        <p className="rounded-2xl border border-base-800 bg-base-950/70 p-4 text-sm leading-6 text-neutral-300">
          Les informations sont à fournir en cas de problème à l’adresse email :{' '}
          <span className="font-semibold text-neutral-50">contact@pulse-room.app</span>
        </p>
        <div className="mt-4 grid gap-3 text-sm text-neutral-400 sm:grid-cols-2">
          <SupportItem icon={CircleHelp} text="Nom ou pseudo du membre concerné." />
          <SupportItem icon={CalendarDays} text="Date, heure et action testée." />
          <SupportItem icon={BadgeCheck} text="Message d’erreur exact ou capture d’écran." />
          <SupportItem icon={Vibrate} text="Statut Lovense affiché : connecté ou déconnecté." />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
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
