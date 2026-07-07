'use client';

import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { changeOwnPassword, type PasswordFormState } from '@/server-actions/auth';

const initialState: PasswordFormState = {};

export function AccountPasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(changeOwnPassword, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success('Mot de passe mis à jour.');
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="card flex max-w-2xl flex-col gap-4 p-5">
      <Field label="Mot de passe actuel" error={state.errors?.currentPassword}>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="input-field"
          required
        />
      </Field>

      <Field label="Nouveau mot de passe" error={state.errors?.newPassword}>
        <input name="newPassword" type="password" autoComplete="new-password" className="input-field" minLength={8} required />
      </Field>

      <Field label="Confirmer le nouveau mot de passe" error={state.errors?.confirmPassword}>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="input-field"
          minLength={8}
          required
        />
      </Field>

      <div className="flex justify-end">
        <button type="submit" disabled={isPending} className="btn-accent">
          {isPending ? 'Mise à jour...' : 'Changer le mot de passe'}
        </button>
      </div>
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
