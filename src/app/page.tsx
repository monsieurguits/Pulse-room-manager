import Link from 'next/link';
import { ArrowRight, LockKeyhole, Sparkles, Users } from 'lucide-react';
import { getCurrentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect('/dashboard');

  return (
    <main className="relative min-h-[calc(100svh-10rem)] overflow-hidden bg-[#050509] px-4 py-8 text-neutral-100 sm:min-h-[calc(100svh-5.5rem)]">
      <div className="login-animated-gradient absolute inset-0" />
      <div className="login-ambient-glow absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(5,5,9,0.2)_0%,rgba(5,5,9,0.72)_45%,rgba(5,5,9,0.96)_100%)]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100svh-12rem)] w-full max-w-5xl flex-col items-center justify-center text-center">
        <img src="/pulseroom-logo-transparent.png" alt="PULSEROOM" className="mb-6 h-44 w-44 object-contain" />
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-xl">
          <Sparkles size={14} />
          Plateforme privée pour modèles
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight text-neutral-50 sm:text-6xl">
          Gérez vos accès FanClub et vos sessions Lovense depuis un espace professionnel.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
          PULSEROOM accompagne les modèles qui veulent organiser leurs membres, sécuriser leurs accès et centraliser leurs outils
          de contrôle dans une interface claire.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Link href="/devenir-membre" className="btn-accent min-h-12 flex-1 justify-center">
            <Users size={18} />
            Devenir membre
            <ArrowRight size={17} />
          </Link>
          <Link href="/login" className="btn-secondary min-h-12 flex-1 justify-center">
            <LockKeyhole size={18} />
            Se connecter
          </Link>
        </div>
      </section>
    </main>
  );
}
