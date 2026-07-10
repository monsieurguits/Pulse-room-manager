'use client';

import Link from 'next/link';
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Member } from '@prisma/client';
import { toast } from 'sonner';
import { Ban, Copy, ExternalLink, Pencil, PlusCircle, QrCode, RotateCcw, Trash2, X } from 'lucide-react';
import { StatusBadge, deriveMemberStatus } from '@/components/status-badge';
import { MemberTierBadge } from '@/components/member-tier-badge';
import { buildMemberInviteMessage } from '@/lib/member-invite-message';
import { formatDuration } from '@/lib/utils';
import { addMemberCredit, deleteMembers, suspendMember, resetCredit, type AddMemberCreditState } from '@/server-actions/members';

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteRequest, setDeleteRequest] = useState<{ ids: string[]; label: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedCount = selectedIds.length;
  const allVisibleSelected = useMemo(
    () => members.length > 0 && members.every((member) => selectedIds.includes(member.id)),
    [members, selectedIds]
  );

  if (members.length === 0) {
    return <p className="p-6 text-center text-sm text-neutral-500">Aucun membre ne correspond à ces critères.</p>;
  }

  function copyLink(member: Member) {
    navigator.clipboard.writeText(buildMemberInviteMessage({ username: member.username, accessCode: member.accessCode }));
    toast.success('Message avec code copié dans le presse-papiers.');
  }

  function toggleMember(memberId: string) {
    setSelectedIds((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId]
    );
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        const visibleIds = new Set(members.map((member) => member.id));
        return current.filter((id) => !visibleIds.has(id));
      }
      return [...new Set([...current, ...members.map((member) => member.id)])];
    });
  }

  function deleteSelected() {
    if (selectedIds.length === 0) return;
    const label = selectedIds.length > 1 ? `${selectedIds.length} membres` : 'ce membre';
    setDeleteRequest({ ids: selectedIds, label });
  }

  function confirmDeleteRequest() {
    if (!deleteRequest) return;
    const idsToDelete = deleteRequest.ids;

    startTransition(() => {
      deleteMembers(idsToDelete)
        .then((result) => {
          setSelectedIds([]);
          setDeleteRequest(null);
          router.refresh();
          if (result.deleted > 0) {
            toast.success(`${result.deleted} membre(s) supprimé(s).`);
          } else {
            toast.warning('Aucun membre supprimé.');
          }
        })
        .catch((error) => toast.error((error as Error).message || 'Suppression impossible.'));
    });
  }

  function deleteOne(member: Member) {
    setDeleteRequest({ ids: [member.id], label: member.username });
  }

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-base-800 bg-base-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-3 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleAllVisible}
            className="h-4 w-4 rounded border-base-700 bg-base-950 accent-accent-500"
          />
          Tout sélectionner sur cette page
        </label>

        <button
          type="button"
          disabled={selectedCount === 0 || isPending}
          onClick={deleteSelected}
          className="btn-secondary justify-center text-red-300 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={16} />
          {isPending ? 'Suppression...' : `Supprimer la sélection${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
        </button>
      </div>

      <div className="divide-y divide-base-800 md:hidden">
        {members.map((member) => {
          const status = deriveMemberStatus(member);
          return (
            <article key={member.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="mt-1 h-4 w-4 rounded border-base-700 bg-base-950 accent-accent-500"
                    />
                    <span>
                      <Link href={`/members/${member.id}`} className="break-words font-semibold text-neutral-100">
                        {member.username}
                      </Link>
                      <span className="mt-1 block text-xs text-neutral-500">{member.platform}</span>
                    </span>
                  </label>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-neutral-400">
                <div className="flex items-center justify-between gap-3">
                  <span>Niveau</span>
                  <MemberTierBadge weeklyCredit={member.weeklyCredit} />
                </div>
                <InfoLine label="Crédit" value={formatDuration(member.remainingCredit)} />
                <InfoLine label="Code FanClub /join" value={member.accessCode ?? 'Non généré'} />
                <InfoLine label="Expiration" value={new Date(member.endDate).toLocaleDateString('fr-FR')} />
              </div>
              <MemberActions member={member} copyLink={copyLink} deleteOne={deleteOne} isPending={isPending} onChanged={() => router.refresh()} />
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-base-800 bg-base-850/50 text-neutral-500">
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Sélection</span>
              </th>
              <th className="px-4 py-3 font-medium">Pseudo</th>
              <th className="px-4 py-3 font-medium">Niveau</th>
              <th className="px-4 py-3 font-medium">Plateforme</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Code FanClub</th>
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
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="h-4 w-4 rounded border-base-700 bg-base-950 accent-accent-500"
                      aria-label={`Sélectionner ${member.username}`}
                    />
                  </td>
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
                  <td className="px-4 py-3 font-mono font-semibold text-accent-300">{member.accessCode ?? '-'}</td>
                  <td className="px-4 py-3">{formatDuration(member.remainingCredit)}</td>
                  <td className="px-4 py-3">{new Date(member.endDate).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <MemberActions member={member} copyLink={copyLink} deleteOne={deleteOne} isPending={isPending} onChanged={() => router.refresh()} table />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleteRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-base-900 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-50">Confirmer la suppression</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  Voulez-vous supprimer définitivement {deleteRequest.label} ? Cette action supprimera aussi ses sessions et
                  événements associés.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary justify-center"
                disabled={isPending}
                onClick={() => setDeleteRequest(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-accent justify-center bg-red-500 text-white hover:bg-red-400"
                disabled={isPending}
                onClick={confirmDeleteRequest}
              >
                {isPending ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
  deleteOne,
  isPending,
  onChanged,
  table = false,
}: {
  member: Member;
  copyLink: (member: Member) => void;
  deleteOne: (member: Member) => void;
  isPending: boolean;
  onChanged: () => void;
  table?: boolean;
}) {
  return (
    <div className={table ? 'flex items-center justify-end gap-1.5' : 'mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8'}>
      <button
        title="Copier le message avec lien sécurisé"
        onClick={() => copyLink(member)}
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
        onClick={() => resetCredit(member.id).then(() => {
          toast.success('Crédit réinitialisé.');
          onChanged();
        })}
        className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-accent-400"
      >
        <RotateCcw size={16} className="mx-auto" />
      </button>
      <AddCreditQuickButton member={member} onAdded={onChanged} />
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
            {
              toast.success(member.active ? 'Membre suspendu.' : 'Membre réactivé.');
              onChanged();
            }
          )
        }
        className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-amber-400"
      >
        <Ban size={16} className="mx-auto" />
      </button>
      <button
        title="Supprimer"
        disabled={isPending}
        onClick={() => deleteOne(member)}
        className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-red-400"
      >
        <Trash2 size={16} className="mx-auto" />
      </button>
    </div>
  );
}

function AddCreditQuickButton({ member, onAdded }: { member: Member; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AddMemberCreditState, FormData>(addMemberCredit.bind(null, member.id), {});
  const handledStateRef = useRef<AddMemberCreditState | null>(null);

  useEffect(() => {
    if (state.success && state.addedSeconds) {
      if (handledStateRef.current === state) return;
      handledStateRef.current = state;

      toast.success(`${formatDuration(state.addedSeconds)} ajoutés à ${member.username}.`);
      setOpen(false);
      onAdded();
    }
  }, [member.username, onAdded, state.addedSeconds, state.success]);

  return (
    <>
      <button
        type="button"
        title="Ajouter du crédit"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-neutral-400 hover:bg-base-800 hover:text-cyan-300"
      >
        <PlusCircle size={16} className="mx-auto" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form action={action} className="w-full max-w-sm rounded-2xl border border-white/10 bg-base-900 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-neutral-50">Ajouter du crédit</h2>
                <p className="mt-1 text-sm text-neutral-400">{member.username}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-base-700 bg-base-850 p-2 text-neutral-300 hover:text-white"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-neutral-200">Minutes à ajouter</span>
              <input name="minutes" type="number" min="1" max="10" step="1" defaultValue="1" className="input-field" required />
              {state.errors?.minutes ? <span className="mt-2 block text-xs text-red-300">{state.errors.minutes[0]}</span> : null}
              {state.errors?._form ? <span className="mt-2 block text-xs text-red-300">{state.errors._form[0]}</span> : null}
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary justify-center" disabled={pending}>
                Annuler
              </button>
              <button type="submit" className="btn-accent justify-center" disabled={pending}>
                {pending ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
