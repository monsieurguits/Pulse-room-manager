'use client';

import { useState, useTransition } from 'react';
import { ShieldOff, X } from 'lucide-react';
import { demoteAdminToModel } from '@/server-actions/admin-users';

export function DemoteAdminButton({ adminId, adminName }: { adminId: string; adminName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmDemotion() {
    startTransition(async () => {
      await demoteAdminToModel(adminId);
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-amber-200 hover:border-amber-400 hover:text-amber-100">
        <ShieldOff size={17} />
        Repasser modèle
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center">
          <section className="max-h-[calc(100svh-3rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/15 bg-base-900 p-5 text-neutral-100 shadow-2xl shadow-black/50 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200">
                <ShieldOff size={24} />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-base-700 bg-base-850 p-2 text-neutral-300 hover:text-white"
                aria-label="Fermer"
              >
                <X size={17} />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-neutral-50">Repasser cet admin en modèle ?</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              <span className="font-semibold text-neutral-100">{adminName}</span> perdra les fonctions propriétaire : gestion des modèles,
              paramètres globaux, maintenance et vue complète des membres.
            </p>
            <p className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              La personne devra se reconnecter pour appliquer ses nouveaux droits.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary justify-center" disabled={pending}>
                Annuler
              </button>
              <button type="button" onClick={confirmDemotion} className="btn-accent justify-center" disabled={pending}>
                {pending ? 'Validation...' : 'Confirmer'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
