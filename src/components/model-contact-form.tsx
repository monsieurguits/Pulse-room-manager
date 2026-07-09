'use client';

import { useActionState } from 'react';
import { Send } from 'lucide-react';
import { CONTACT_PLATFORMS } from '@/lib/contact-platforms';
import { submitModelContactRequest, type ContactRequestState } from '@/server-actions/contact';

const initialState: ContactRequestState = {};

export function ModelContactForm() {
  const [state, action, pending] = useActionState(submitModelContactRequest, initialState);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" error={state.errors?.lastName?.[0]}>
          <input name="lastName" className="input-field" autoComplete="family-name" required maxLength={80} />
        </Field>
        <Field label="Prénom" error={state.errors?.firstName?.[0]}>
          <input name="firstName" className="input-field" autoComplete="given-name" required maxLength={80} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pseudo" error={state.errors?.pseudo?.[0]}>
          <input name="pseudo" className="input-field" required maxLength={80} />
        </Field>
        <Field label="Email" error={state.errors?.email?.[0]}>
          <input name="email" type="email" className="input-field" autoComplete="email" required maxLength={120} />
        </Field>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-neutral-200">Plateformes utilisées</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_PLATFORMS.map((platform) => (
            <label
              key={platform}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-base-800 bg-base-950/70 px-4 py-3 text-sm text-neutral-300 transition hover:border-accent-500/40 hover:text-neutral-100"
            >
              <input name="platforms" type="checkbox" value={platform} className="h-4 w-4 accent-[#ff2d87]" />
              <span>{platform}</span>
            </label>
          ))}
        </div>
        {state.errors?.platforms ? <p className="mt-2 text-xs text-red-300">{state.errors.platforms[0]}</p> : null}
      </div>

      <Field label="Message" error={state.errors?.message?.[0]} optional>
        <textarea
          name="message"
          className="input-field min-h-32 resize-y"
          maxLength={1200}
          placeholder="Votre activité, votre besoin, vos questions..."
        />
      </Field>

      <label className="flex items-start gap-3 rounded-2xl border border-base-800 bg-base-950/70 p-4 text-sm leading-6 text-neutral-300">
        <input name="contactConsent" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#ff2d87]" required />
        <span>Je souhaite être contacté par mail par l’équipe de pulse-room.app.</span>
      </label>
      {state.errors?.contactConsent ? <p className="-mt-3 text-xs text-red-300">{state.errors.contactConsent[0]}</p> : null}

      {state.error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-accent min-h-12 w-full justify-center">
        <Send size={17} />
        {pending ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  optional,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-neutral-200">
        {label}
        {optional ? <span className="text-xs font-normal text-neutral-500">Optionnel</span> : null}
      </span>
      {children}
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
