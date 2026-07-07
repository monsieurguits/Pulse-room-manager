'use client';

import { useActionState } from 'react';
import { loginAdmin, type LoginFormState } from '@/server-actions/auth';

const initialState: LoginFormState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-950 px-4 text-neutral-100">
      <form action={formAction} className="card flex w-full max-w-sm flex-col gap-5 p-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-50">Connexion admin</h1>
          <p className="mt-1 text-sm text-neutral-400">Accès propriétaire ou modèle.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-300">Email</span>
          <input name="email" type="email" autoComplete="email" className="input-field" required />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-300">Mot de passe</span>
          <input name="password" type="password" autoComplete="current-password" className="input-field" required />
        </label>

        {state.error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn-accent min-h-12">
          {isPending ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}
