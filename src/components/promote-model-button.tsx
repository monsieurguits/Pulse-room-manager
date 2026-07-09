'use client';

import { useState, useTransition } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { promoteModelToOwner } from '@/server-actions/admin-users';

export function PromoteModelButton({ modelId, modelName }: { modelId: string; modelName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmPromotion() {
    startTransition(async () => {
      await promoteModelToOwner(modelId);
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-cyan-200 hover:border-cyan-400 hover:text-cyan-100">
        <ShieldCheck size={17} />
        Passer admin
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-3xl border border-white/15 bg-base-900 p-6 text-neutral-100 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                <ShieldCheck size={24} />
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

            <h2 className="mt-5 text-xl font-bold text-neutral-50">Passer ce modèle en admin ?</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              <span className="font-semibold text-neutral-100">{modelName}</span> aura accès aux fonctions propriétaire :
              gestion des modèles, paramètres globaux, maintenance et vue complète des membres.
            </p>
            <p className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              La personne devra se reconnecter pour obtenir ses nouveaux droits.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary justify-center" disabled={pending}>
                Annuler
              </button>
              <button type="button" onClick={confirmPromotion} className="btn-accent justify-center" disabled={pending}>
                {pending ? 'Validation...' : 'Confirmer'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
