'use client';

import { useActionState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { addMemberCredit, type AddMemberCreditState } from '@/server-actions/members';
import { formatDuration } from '@/lib/utils';

export function AddMemberCreditForm({ memberId }: { memberId: string }) {
  const [state, action, pending] = useActionState<AddMemberCreditState, FormData>(addMemberCredit.bind(null, memberId), {});

  useEffect(() => {
    if (state.success && state.addedSeconds) {
      toast.success(`${formatDuration(state.addedSeconds)} ajoutés au membre.`);
    }
  }, [state.success, state.addedSeconds]);

  return (
    <form action={action} className="card p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
          <Plus size={20} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-200">Ajouter du crédit</h2>
          <p className="text-xs text-neutral-500">Ajoutez entre 1 et 10 minutes au crédit restant du membre.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-neutral-200">Minutes à ajouter</span>
          <input name="minutes" type="number" min="1" max="10" step="1" defaultValue="1" className="input-field" required />
          {state.errors?.minutes ? <span className="mt-2 block text-xs text-red-300">{state.errors.minutes[0]}</span> : null}
          {state.errors?._form ? <span className="mt-2 block text-xs text-red-300">{state.errors._form[0]}</span> : null}
        </label>

        <button type="submit" disabled={pending} className="btn-accent self-end justify-center">
          <Plus size={17} />
          {pending ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}
