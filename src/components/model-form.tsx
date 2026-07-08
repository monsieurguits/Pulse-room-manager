'use client';

import { useActionState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { createModelAdmin, type ModelFormState } from '@/server-actions/admin-users';

const initialState: ModelFormState = {};

export function ModelForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createModelAdmin, initialState);
  const loginUrl = typeof window === 'undefined' ? 'https://pulse-room.app' : window.location.origin;

  const fallbackCredentials = useMemo(() => {
    if (!state.createdEmail || !state.temporaryPassword) return '';

    return [
      'Identifiants PULSEROOM',
      '',
      `Adresse de connexion : ${loginUrl}`,
      `Identifiant : ${state.createdEmail}`,
      `Mot de passe temporaire : ${state.temporaryPassword}`,
      '',
      'Important : merci de modifier le mot de passe dès la première connexion.',
    ].join('\n');
  }, [loginUrl, state.createdEmail, state.temporaryPassword]);

  useEffect(() => {
    if (state.success) {
      if (state.emailWarning) {
        toast.warning(`Compte modèle créé, mais email non envoyé : ${state.emailWarning}`);
      } else {
        toast.success('Compte modèle créé et email de bienvenue envoyé.');
        formRef.current?.reset();
      }
    }
  }, [state.success, state.emailWarning]);

  return (
    <div className="grid gap-4">
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

      {state.emailWarning && state.createdEmail && state.temporaryPassword ? (
        <div className="card border-amber-300/25 bg-amber-300/10 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-amber-100">Compte créé, email non envoyé</h2>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">
                Le compte modèle existe bien. Comme l’email n’a pas pu partir, copie ces identifiants et envoie-les
                manuellement au modèle.
              </p>
              <div className="mt-4 rounded-2xl border border-amber-200/20 bg-base-950/70 p-4 text-sm text-neutral-100">
                <p>
                  <span className="text-neutral-500">Identifiant :</span> {state.createdEmail}
                </p>
                <p className="mt-2">
                  <span className="text-neutral-500">Mot de passe temporaire :</span> {state.temporaryPassword}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(fallbackCredentials);
                toast.success('Identifiants copiés.');
              }}
            >
              <Copy size={16} />
              Copier les identifiants
            </button>
          </div>
        </div>
      ) : null}
    </div>
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
