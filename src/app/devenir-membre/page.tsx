import Link from 'next/link';
import { ArrowLeft, BadgeCheck, LockKeyhole, MonitorPlay, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { ModelContactForm } from '@/components/model-contact-form';

export const dynamic = 'force-dynamic';

export default function BecomeMemberPage() {
  return (
    <main className="relative min-h-[calc(100svh-10rem)] overflow-hidden bg-[#050509] px-4 py-8 text-neutral-100 sm:min-h-[calc(100svh-5.5rem)]">
      <div className="login-animated-gradient absolute inset-0" />
      <div className="login-ambient-glow absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(5,5,9,0.18)_0%,rgba(5,5,9,0.72)_45%,rgba(5,5,9,0.96)_100%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="rounded-3xl border border-white/15 bg-[rgba(5,5,9,0.42)] p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white">
            <ArrowLeft size={16} />
            Retour
          </Link>
          <img src="/pulseroom-logo-transparent.png" alt="PULSEROOM" className="mb-6 h-32 w-32 object-contain" />
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            <Sparkles size={14} />
            Devenir modèle PULSEROOM
          </p>
          <h1 className="text-3xl font-black leading-tight text-neutral-50 sm:text-5xl">
            Un espace pensé pour gérer vos membres et vos sessions privées.
          </h1>
          <p className="mt-5 text-sm leading-7 text-neutral-300">
            PULSEROOM vous aide à organiser vos accès FanClub, connecter vos appareils compatibles Lovense, suivre vos membres et
            proposer une expérience plus propre pendant vos lives ou contenus privés.
          </p>

          <div className="mt-6 grid gap-3">
            <Benefit icon={Users} text="Gestion claire des membres et de leurs accès personnels." />
            <Benefit icon={MonitorPlay} text="Overlay OBS pour afficher les prises de contrôle pendant vos diffusions." />
            <Benefit icon={ShieldCheck} text="Liens privés, codes membres et données organisées dans un espace sécurisé." />
            <Benefit icon={BadgeCheck} text="Accompagnement pour préparer votre configuration et vos documents." />
          </div>
        </section>

        <section className="rounded-3xl border border-white/15 bg-[rgba(5,5,9,0.5)] p-6 shadow-2xl shadow-black/45 backdrop-blur-2xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-300">
              <LockKeyhole size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-50">Demande de contact</h2>
              <p className="text-sm text-neutral-400">L’équipe PULSEROOM vous répondra par mail sous 24/48h.</p>
            </div>
          </div>
          <ModelContactForm />
        </section>
      </div>
    </main>
  );
}

function Benefit({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-neutral-300">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" />
      <span>{text}</span>
    </div>
  );
}
