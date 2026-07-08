import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Pencil, QrCode } from 'lucide-react';
import { db } from '@/lib/db';
import { StatusBadge, deriveMemberStatus } from '@/components/status-badge';
import { MemberTierBadge } from '@/components/member-tier-badge';
import { RecentSessionsTable } from '@/components/recent-sessions-table';
import { formatDuration } from '@/lib/utils';
import { CopySecureLinkButton } from '@/components/copy-secure-link-button';
import { canAccessMember, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const member = await db.member.findUnique({
    where: { id },
    include: { sessions: { orderBy: { startedAt: 'desc' }, take: 50 } },
  });

  if (!member || !canAccessMember(admin, member)) notFound();

  const status = deriveMemberStatus(member);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-words text-2xl font-bold text-neutral-50">{member.username}</h1>
            <StatusBadge status={status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MemberTierBadge weeklyCredit={member.weeklyCredit} />
            <span className="text-sm text-neutral-400">{member.platform}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:flex">
          <CopySecureLinkButton token={member.secureToken} username={member.username} />
          <a href={`/control/${member.secureToken}`} target="_blank" className="btn-secondary">
            <ExternalLink size={16} />
            Ouvrir le contrôle
          </a>
          <Link href={`/members/${member.id}/qr`} className="btn-secondary">
            <QrCode size={16} />
            QR Code
          </Link>
          <Link href={`/members/${member.id}/edit`} className="btn-accent">
            <Pencil size={16} />
            Modifier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card flex items-center p-5">
          <MemberTierBadge weeklyCredit={member.weeklyCredit} size="large" className="mx-0" />
        </div>
        <InfoCard label="Crédit restant" value={formatDuration(member.remainingCredit)} />
        <InfoCard label="Crédit hebdomadaire" value={formatDuration(member.weeklyCredit)} />
        <InfoCard label="Expiration" value={new Date(member.endDate).toLocaleDateString('fr-FR')} />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-200">Appareil Lovense</h2>
        {member.toyName ? (
          <div className="flex flex-col gap-3 text-sm text-neutral-300 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <span>
              Jouet : <strong className="text-neutral-100">{member.toyName}</strong>
            </span>
            <span>
              Connexion :{' '}
              <strong className={member.connected ? 'text-emerald-400' : 'text-red-400'}>
                {member.connected ? 'Connecté' : 'Déconnecté'}
              </strong>
            </span>
            {member.battery !== null && (
              <span>
                Batterie : <strong className="text-neutral-100">{member.battery}%</strong>
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            Aucun appareil appairé. Utilisez le QR code pour associer un jouet Lovense.
          </p>
        )}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-200">Historique des sessions</h2>
        <RecentSessionsTable sessions={member.sessions} />
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-50">{value}</p>
    </div>
  );
}
