'use client';

import { useActionState } from 'react';
import { loginAdmin, type LoginFormState } from '@/server-actions/auth';

const initialState: LoginFormState = {};

export function LoginForm({ contactSent }: { contactSent?: boolean }) {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

  return (
    <form
      action={formAction}
      className="relative z-10 flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-white/15 bg-[rgba(5,5,9,0.46)] p-6 shadow-2xl shadow-black/45 backdrop-blur-2xl"
    >
      <div className="flex flex-col items-center text-center">
        <img src="/pulseroom-logo-transparent.png" alt="PULSEROOM" className="mb-4 h-40 w-40 object-contain" />
        <h1 className="text-2xl font-bold text-neutral-50">Connexion admin</h1>
        <p className="mt-1 text-sm text-neutral-400">Accès propriétaire ou modèle.</p>
      </div>

      {contactSent ? (
        <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm leading-6 text-emerald-200">
          Votre demande a bien été envoyée. Un mail vous sera envoyé sous 24/48h.
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-300">Email</span>
        <input name="email" type="email" autoComplete="email" className="input-field" required />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-300">Mot de passe</span>
        <input name="password" type="password" autoComplete="current-password" className="input-field" required />
      </label>

      {state.error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-accent min-h-12">
        {isPending ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
