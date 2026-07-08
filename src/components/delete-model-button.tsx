'use client';

import { Trash2 } from 'lucide-react';
import { deleteModelAdmin } from '@/server-actions/admin-users';

export function DeleteModelButton({ modelId, modelName }: { modelId: string; modelName: string }) {
  return (
    <form
      action={deleteModelAdmin.bind(null, modelId)}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Supprimer le modèle "${modelName}" ? Ses membres seront réattribués à votre compte propriétaire.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 xl:w-auto"
        type="submit"
      >
        <Trash2 size={16} />
        Supprimer
      </button>
    </form>
  );
}
