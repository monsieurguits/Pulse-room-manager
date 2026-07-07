'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { MemberTierBadge } from '@/components/member-tier-badge';

interface Props {
  secureToken: string;
  username: string;
  platform: string;
  weeklyCredit: number;
}

export function TermsAcceptancePanel({ secureToken, username, platform, weeklyCredit }: Props) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accepted) {
      toast.error('Vous devez accepter les conditions pour continuer.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/control/accept-terms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secureToken, accepted }),
        });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error ?? "Impossible d'enregistrer l'acceptation.");
        }

        toast.success('Conditions acceptées.');
        router.refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  return (
    <main className="min-h-screen bg-base-950 px-4 py-6 text-neutral-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <section className="overflow-hidden rounded-[28px] border border-base-700 bg-base-900 shadow-2xl">
          <div className="border-t-4 border-accent-500 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase text-neutral-500">Première connexion</p>
            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-4xl font-black text-neutral-50 sm:text-5xl">{username}</h1>
                <p className="mt-2 text-sm font-medium text-neutral-400">{platform}</p>
              </div>
              <MemberTierBadge weeklyCredit={weeklyCredit} size="large" className="mx-0 self-start sm:self-center" />
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-base-700 bg-base-900 p-5 shadow-2xl sm:p-7">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-50">Conditions de sécurité, confidentialité et jeu</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Avant d&apos;accéder à votre espace membre, merci de lire et d&apos;accepter les règles ci-dessous.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TermsCard
              icon={<ShieldCheck size={20} />}
              title="Sécurité"
              text="Votre confort et votre sécurité passent avant tout. Vous pouvez arrêter le contrôle à tout moment. En cas de gêne, douleur, malaise ou envie d'arrêter, mettez immédiatement fin à la session."
            />
            <TermsCard
              icon={<LockKeyhole size={20} />}
              title="Confidentialité"
              text="Votre lien est personnel et ne doit pas être partagé publiquement. Les informations techniques sont utilisées uniquement pour gérer l'accès, le temps de contrôle, les sessions et la connexion à l'appareil."
            />
            <TermsCard
              icon={<Sparkles size={20} />}
              title="Règles de jeu"
              text="Chaque membre dispose d'un temps hebdomadaire selon son niveau. Une seule personne peut contrôler à la fois. En cas de session active, vous serez placé sur liste d'attente."
            />
          </div>

          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-300" />
              <p className="text-sm leading-6 text-amber-100">
                Toute utilisation abusive, tentative de contournement, partage non autorisé du lien ou comportement non conforme peut entraîner la suspension de l&apos;accès.
              </p>
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-base-800 bg-base-950/70 p-4">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-accent-500"
              required
            />
            <span className="text-sm leading-6 text-neutral-300">
              Je confirme avoir lu et compris les conditions de sécurité, de confidentialité et de jeu. J&apos;accepte d&apos;utiliser ce service de manière responsable, respectueuse et sécurisée.
            </span>
          </label>

          <button type="submit" disabled={!accepted || isPending} className="btn-accent mt-6 min-h-12 w-full">
            {isPending ? 'Validation...' : 'Accepter et accéder à mon espace'}
          </button>
        </form>
      </div>
    </main>
  );
}

function TermsCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-950/70 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-base-700 bg-base-850 text-accent-400">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-neutral-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{text}</p>
    </div>
  );
}
