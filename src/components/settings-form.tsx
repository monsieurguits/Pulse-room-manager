'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Settings } from '@prisma/client';
import { updateSettings, type SettingsFormState } from '@/server-actions/settings';

const initialState: SettingsFormState = {};

/**
 * IMPORTANT sécurité : `settings` peut contenir un Developer Token existant,
 * mais on ne le rend JAMAIS dans le HTML. Le champ reste vide par défaut ;
 * le laisser vide lors de la soumission conserve la valeur déjà stockée
 * côté serveur (voir server-actions/settings.ts upsert avec `update`).
 */
export function SettingsForm({
  settings,
  hasExistingToken,
}: {
  settings: Settings | null;
  hasExistingToken: boolean;
}) {
  const [state, formAction, isPending] = useActionState(updateSettings, initialState);

  useEffect(() => {
    if (state.success) toast.success('Paramètres enregistrés.');
  }, [state.success]);

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-6">
      <Field label="Nom de l'application" error={state.errors?.applicationName}>
        <input
          name="applicationName"
          defaultValue={settings?.applicationName ?? 'Pulse Room Manager'}
          className="input-field"
          required
        />
      </Field>

      <Field label="Developer Token Lovense" error={state.errors?.developerToken}>
        <input
          type="password"
          name="developerToken"
          placeholder={hasExistingToken ? '•••••••••••••••• (laisser vide pour conserver)' : 'Collez votre token ici'}
          className="input-field"
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Jamais transmis au navigateur : utilisé uniquement côté serveur.
        </p>
      </Field>

      <Field label="Callback URL" error={state.errors?.callbackUrl}>
        <input
          name="callbackUrl"
          defaultValue={settings?.callbackUrl}
          placeholder="https://votre-domaine.example.com/api/lovense/callback"
          className="input-field"
          required
        />
      </Field>

      <Field label="Heartbeat (secondes)" error={state.errors?.heartbeatSeconds}>
        <input
          type="number"
          name="heartbeatSeconds"
          min={5}
          defaultValue={settings?.heartbeatSeconds ?? 30}
          className="input-field"
          required
        />
      </Field>

      <Field label="Domaine public" error={state.errors?.domain}>
        <input
          name="domain"
          defaultValue={settings?.domain}
          placeholder="https://votre-domaine.example.com"
          className="input-field"
          required
        />
      </Field>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isPending} className="btn-accent">
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
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
