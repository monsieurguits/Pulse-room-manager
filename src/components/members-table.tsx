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
    <table className="w-full text-left text-sm">
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
                <div className="flex items-center justify-end gap-1.5">
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
                    className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-accent-400"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <Link
                    href={`/members/${member.id}/qr`}
                    title="QR Code d'appairage"
                    className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-accent-400"
                  >
                    <QrCode size={16} />
                  </Link>
                  <button
                    title="Réinitialiser le crédit"
                    onClick={() => resetCredit(member.id).then(() => toast.success('Crédit réinitialisé.'))}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-accent-400"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <Link
                    href={`/members/${member.id}/edit`}
                    title="Modifier"
                    className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-accent-400"
                  >
                    <Pencil size={16} />
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
                    <Ban size={16} />
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
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
