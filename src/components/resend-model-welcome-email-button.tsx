'use client';

import { useState, useTransition } from 'react';
import { Mail, X } from 'lucide-react';
import { toast } from 'sonner';
import { resendModelWelcomeEmail } from '@/server-actions/admin-users';

export function ResendModelWelcomeEmailButton({ modelId, modelName }: { modelId: string; modelName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmSend() {
    startTransition(async () => {
      const result = await resendModelWelcomeEmail(modelId);

      if (result.success) {
        toast.success(`Email d'inscription renvoyé à ${modelName}.`);
        setOpen(false);
        return;
      }

      toast.error(result.error ?? "L'email n'a pas pu être envoyé.");
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-cyan-200 hover:border-cyan-400 hover:text-cyan-100">
        <Mail size={17} />
        Renvoyer email
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center">
          <section className="max-h-[calc(100svh-3rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/15 bg-base-900 p-5 text-neutral-100 shadow-2xl shadow-black/50 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                <Mail size={24} />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-base-700 bg-base-850 p-2 text-neutral-300 hover:text-white"
                aria-label="Fermer"
              >
                <X size={17} />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-neutral-50">Renvoyer l&apos;email d&apos;inscription ?</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              L&apos;email de bienvenue sera renvoyé à <span className="font-semibold text-neutral-100">{modelName}</span> avec son
              mot de passe temporaire enregistré.
            </p>
            <p className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              Si ce compte a été créé avant l&apos;enregistrement du mot de passe temporaire, l&apos;envoi sera refusé et il faudra
              utiliser la réinitialisation du mot de passe.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary justify-center" disabled={pending}>
                Annuler
              </button>
              <button type="button" onClick={confirmSend} className="btn-accent justify-center" disabled={pending}>
                {pending ? 'Envoi...' : 'Renvoyer'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
