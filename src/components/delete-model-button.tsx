'use client';

import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteModelAdmin } from '@/server-actions/admin-users';

export function DeleteModelButton({ modelId, modelName, role = 'MODEL' }: { modelId: string; modelName: string; role?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <form ref={formRef} action={deleteModelAdmin.bind(null, modelId)}>
        <button
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 xl:w-auto"
          type="button"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      </form>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-base-900 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-50">Supprimer le modèle</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  Voulez-vous supprimer définitivement {modelName} ? Ses membres seront réattribués à votre compte
                  propriétaire{role === 'OWNER' ? ' et ses accès admin seront supprimés' : ''}.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary justify-center" onClick={() => setConfirmOpen(false)}>
                Annuler
              </button>
              <button
                type="button"
                className="btn-accent justify-center bg-red-500 text-white hover:bg-red-400"
                onClick={() => formRef.current?.requestSubmit()}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
