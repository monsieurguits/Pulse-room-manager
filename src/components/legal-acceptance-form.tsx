'use client';

import { useActionState, useState } from 'react';
import type { LegalAcceptanceState } from '@/server-actions/auth';

const initialState: LegalAcceptanceState = {};

export function LegalAcceptanceForm({
  action,
  plan,
  trial,
}: {
  action: (prev: LegalAcceptanceState, formData: FormData) => Promise<LegalAcceptanceState>;
  plan?: string;
  trial?: string;
}) {
  const [checked, setChecked] = useState(false);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <aside className="h-fit rounded-2xl border border-white/10 bg-base-900/80 p-5 shadow-xl shadow-black/30 backdrop-blur-xl lg:sticky lg:top-8">
      <h2 className="text-lg font-bold text-neutral-50">Validation obligatoire</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-400">
        Cette acceptation est nécessaire pour activer l&apos;accès à votre espace modèle.
      </p>

      <form action={formAction} className="mt-5 flex flex-col gap-4">
        {plan ? <input type="hidden" name="plan" value={plan} /> : null}
        {trial ? <input type="hidden" name="trial" value={trial} /> : null}
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-base-950/70 p-4">
          <input
            name="accepted"
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-accent-500"
            required
          />
          <span className="text-sm leading-6 text-neutral-300">
            En créant un compte et en utilisant PULSEROOM, vous reconnaissez avoir lu et accepté les Conditions
            Générales d&apos;Utilisation ainsi que la Politique de confidentialité. Vous confirmez également être
            majeur(e) et autorisé(e) à utiliser les services proposés.
          </span>
        </label>

        {state.error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>
        )}

        <button type="submit" disabled={!checked || isPending} className="btn-accent min-h-12">
          {isPending ? 'Validation...' : 'J’accepte et j’accède à mon espace'}
        </button>
      </form>
    </aside>
  );
}
