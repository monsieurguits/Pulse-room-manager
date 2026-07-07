import type { Session } from '@prisma/client';
import { formatDuration } from '@/lib/utils';

export function RecentSessionsTable({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-neutral-500">Aucune session enregistrée pour le moment.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-base-800 text-neutral-500">
            <th className="pb-2 font-medium">Membre</th>
            <th className="pb-2 font-medium">Début</th>
            <th className="pb-2 font-medium">Durée</th>
            <th className="pb-2 font-medium">Crédit utilisé</th>
            <th className="pb-2 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b border-base-800/60 text-neutral-300">
              <td className="py-2.5 font-mono text-xs text-neutral-500">{session.memberId.slice(0, 8)}</td>
              <td className="py-2.5">{new Date(session.startedAt).toLocaleString('fr-FR')}</td>
              <td className="py-2.5">{formatDuration(session.duration)}</td>
              <td className="py-2.5">{formatDuration(session.creditUsed)}</td>
              <td className="py-2.5">
                {session.active ? (
                  <span className="badge bg-accent-500/15 text-accent-400">En cours</span>
                ) : (
                  <span className="badge bg-base-800 text-neutral-400">Terminée</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
