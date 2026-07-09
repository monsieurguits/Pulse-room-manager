'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateAccountProfile, type AccountProfileFormState } from '@/server-actions/auth';

interface Props {
  defaultValues: {
    name: string;
    firstName?: string | null;
    gender?: string | null;
    birthDate?: string | null;
  };
}

export function AccountProfileForm({ defaultValues }: Props) {
  const [state, action, pending] = useActionState<AccountProfileFormState, FormData>(updateAccountProfile, {});

  useEffect(() => {
    if (state.success) {
      toast.success('Profil enregistré.');
    }
  }, [state.success]);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pseudo" error={state.errors?.name?.[0]}>
          <input name="name" className="input-field" defaultValue={defaultValues.name} maxLength={80} required />
        </Field>
        <Field label="Prénom" error={state.errors?.firstName?.[0]}>
          <input name="firstName" className="input-field" defaultValue={defaultValues.firstName ?? ''} maxLength={80} />
        </Field>
        <Field label="Sexe" error={state.errors?.gender?.[0]}>
          <select name="gender" className="input-field" defaultValue={defaultValues.gender ?? ''}>
            <option value="">Non renseigné</option>
            <option value="Femme">Femme</option>
            <option value="Homme">Homme</option>
            <option value="Neutre">Neutre</option>
          </select>
        </Field>
        <Field label="Date de naissance" error={state.errors?.birthDate?.[0]}>
          <input name="birthDate" type="date" className="input-field" defaultValue={defaultValues.birthDate ?? ''} />
        </Field>
      </div>

      <button type="submit" className="btn-accent w-full justify-center sm:w-auto" disabled={pending}>
        {pending ? 'Enregistrement...' : 'Enregistrer le profil'}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-200">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
