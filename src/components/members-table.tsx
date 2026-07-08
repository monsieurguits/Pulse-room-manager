'use client';

import Link from 'next/link';
import type { Member } from '@prisma/client';
import { toast } from 'sonner';
import { Copy, ExternalLink, Pencil, RotateCcw, Ban, Trash2, QrCode } from 'lucide-react';
import { StatusBadge, deriveMemberStatus } from '@/components/status-badge';
import { MemberTierBadge } from '@/components/member-tier-badge';
import { formatDuration } from '@/lib/utils';
import { deleteMember, suspendMember, resetCredit } from '@/server-actions/members';

export function MembersTable({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return <p className="p-6 text-center text-sm text-neutral-500">Aucun membre ne correspond à ces critères.</p>;
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/control/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Lien sécurisé copié dans le presse-papiers.');
  }

  return (
    <>
      <div className="divide-y divide-base-800 md:hidden">
        {members.map((member) => {
          const status = deriveMemberStatus(member);
          return (
            <article key={member.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/members/${member.id}`} className="break-words font-semibold text-neutral-100">
                    {member.username}
                  </Link>
                  <p className="mt-1 text-xs text-neutral-500">{member.platform}</p>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-neutral-400">
                <div className="flex items-center justify-between gap-3">
                  <span>Niveau</span>
                  <MemberTierBadge weeklyCredit={member.weeklyCredit} />
                </div>
                <InfoLine label="Crédit" value={formatDuration(member.remainingCredit)} />
                <InfoLine label="Expiration" value={new Date(member.endDate).toLocaleDateString('fr-FR')} />
              </div>
              <MemberActions member={member} copyLink={copyLink} />
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-base-800 bg-base-850/50 text-neutral-500">
              <th className="px-4 py-3 font-medium">Pseudo</th>
              <th className="px-4 py-3 font-medium">Niveau</th>
              <th className="px-4 py-3 font-medium">Plateforme</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Crédit restant</th>
              <th className="px-4 py-3 font-medium">Expiration</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const status = deriveMemberStatus(member);
              return (
                <tr key={member.id} className="border-b border-base-800/60 text-neutral-300 hover:bg-base-850/40">
                  <td className="px-4 py-3 font-medium text-neutral-100">
                    <Link href={`/members/${member.id}`}>{member.username}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <MemberTierBadge weeklyCredit={member.weeklyCredit} />
                  </td>
                  <td className="px-4 py-3">{member.platform}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3">{formatDuration(member.remainingCredit)}</td>
                  <td className="px-4 py-3">{new Date(member.endDate).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <MemberActions member={member} copyLink={copyLink} table />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-base-800 bg-base-950/60 px-3 py-2">
      <span>{label}</span>
      <span className="text-right font-medium text-neutral-200">{value}</span>
    </div>
  );
}

function MemberActions({
  member,
  copyLink,
  table = false,
}: {
  member: Member;
  copyLink: (token: string) => void;
  table?: boolean;
}) {
  return (
    <div className={table ? 'flex items-center justify-end gap-1.5' : 'mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7'}>
      <button
        title="Copier le lien sécurisé"
        onClick={() => copyLink(member.secureToken)}
        className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-accent-400"
      >
        <Copy size={16} />
      </button>
      <a
        href={`/control/${member.secureToken}`}
        target="_blank"
        title="Ouvrir le lien de contrôle"
        className="rounded-lg p-2 text-center text-neutral-400 hover:bg-base-800 hover:text-accent-400"
      >
        <ExternalLink size={16} className="mx-auto" />
      </a>
      <Link
        href={`/members/${member.id}/qr`}
        title="QR Code d'appairage"
        className="rounded-lg p-2 text-center text-neutral-400 hover:bg-base-800 hover:text-accent-400"
      >
        <QrCode size={16} className="mx-auto" />
      </Link>
      <button
        title="Réinitialiser le crédit"
        onClick={() => resetCredit(member.id).then(() => toast.success('Crédit réinitialisé.'))}
        className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-accent-400"
      >
        <RotateCcw size={16} className="mx-auto" />
      </button>
      <Link
        href={`/members/${member.id}/edit`}
        title="Modifier"
        className="rounded-lg p-2 text-center text-neutral-400 hover:bg-base-800 hover:text-accent-400"
      >
        <Pencil size={16} className="mx-auto" />
      </Link>
      <button
        title={member.active ? 'Suspendre' : 'Réactiver'}
        onClick={() =>
          suspendMember(member.id, member.active).then(() =>
            toast.success(member.active ? 'Membre suspendu.' : 'Membre réactivé.')
          )
        }
        className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-amber-400"
      >
        <Ban size={16} className="mx-auto" />
      </button>
      <button
        title="Supprimer"
        onClick={() => {
          if (confirm(`Supprimer définitivement ${member.username} ?`)) {
            deleteMember(member.id).then(() => toast.success('Membre supprimé.'));
          }
        }}
        className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-red-400"
      >
        <Trash2 size={16} className="mx-auto" />
      </button>
    </div>
  );
}
