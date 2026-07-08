'use client';

import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createModelAdmin, type ModelFormState } from '@/server-actions/admin-users';

const initialState: ModelFormState = {};

export function ModelForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createModelAdmin, initialState);

  useEffect(() => {
    if (state.success) {
      if (state.emailWarning) {
        toast.warning(`Compte modèle créé, mais email non envoyé : ${state.emailWarning}`);
      } else {
        toast.success('Compte modèle créé et email de bienvenue envoyé.');
      }
      formRef.current?.reset();
    }
  }, [state.success, state.emailWarning]);

  return (
    <form ref={formRef} action={formAction} className="card grid gap-4 p-5 lg:grid-cols-[1fr_1fr_1fr_auto]">
      <Field label="Nom" error={state.errors?.name}>
        <input name="name" className="input-field" placeholder="Luna Rose" required />
      </Field>
      <Field label="Email" error={state.errors?.email}>
        <input name="email" type="email" className="input-field" placeholder="modele@example.com" required />
      </Field>
      <Field label="Mot de passe initial" error={state.errors?.password}>
        <input name="password" type="password" className="input-field" minLength={8} required />
      </Field>
      <button type="submit" disabled={isPending} className="btn-accent self-end">
        {isPending ? 'Création...' : 'Créer'}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string[]; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-300">{label}</span>
      {children}
      {error && <span className="text-xs text-red-400">{error[0]}</span>}
    </label>
  );
}
