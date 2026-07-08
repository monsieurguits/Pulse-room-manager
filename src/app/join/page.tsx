'use client';

import { useActionState } from 'react';
import { KeyRound } from 'lucide-react';
import { joinMemberByCode, type JoinFormState } from '@/server-actions/join';

const initialState: JoinFormState = {};

export default function JoinPage() {
  const [state, formAction, isPending] = useActionState(joinMemberByCode, initialState);

  return (
    <main className="relative flex min-h-[calc(100svh-10rem)] items-center justify-center overflow-hidden bg-[#050509] px-4 py-8 text-neutral-100 sm:min-h-[calc(100svh-5.5rem)]">
      <div className="login-animated-gradient absolute inset-0" />
      <div className="login-ambient-glow absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(5,5,9,0.18)_0%,rgba(5,5,9,0.72)_45%,rgba(5,5,9,0.94)_100%)] opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-base-950 via-base-950/80 to-transparent" />

      <form
        action={formAction}
        className="relative z-10 flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-white/15 bg-[rgba(5,5,9,0.46)] p-6 shadow-2xl shadow-black/45 backdrop-blur-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <img src="/pulseroom-logo-transparent.png" alt="PULSEROOM" className="mb-4 h-36 w-36 object-contain" />
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
            <KeyRound size={20} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-50">Accès membre</h1>
          <p className="mt-1 text-sm leading-6 text-neutral-400">Entre le code donné par ton modèle pour ouvrir ton espace de contrôle.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-300">Code membre</span>
          <input
            name="code"
            className="input-field text-center font-mono text-xl uppercase tracking-[0.22em]"
            placeholder="A7K9Q2"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            required
          />
        </label>

        {state.error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>
        ) : null}

        <button type="submit" disabled={isPending} className="btn-accent min-h-12">
          {isPending ? 'Ouverture...' : 'Ouvrir mon accès'}
        </button>
      </form>
    </main>
  );
}
