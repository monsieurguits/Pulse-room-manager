import { redirect } from 'next/navigation';
import { LegalAcceptanceForm } from '@/components/legal-acceptance-form';
import { LEGAL_TERMS_VERSION, hasAcceptedCurrentLegalTerms, requireAdmin } from '@/lib/auth';
import { getCurrentWeeklyLegalUpdate, LEGAL_SECTIONS } from '@/lib/legal-content';
import { acceptLegalTerms } from '@/server-actions/auth';

export const dynamic = 'force-dynamic';

export default async function LegalAcceptPage({
  searchParams,
}: {
  searchParams?: Promise<{
    plan?: string;
    trial?: string;
  }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;

  if (admin.role !== 'MODEL' || hasAcceptedCurrentLegalTerms(admin)) {
    redirect('/dashboard');
  }

  const weeklyUpdate = getCurrentWeeklyLegalUpdate();
  const isUpdate = Boolean(admin.legalAcceptedAt);

  return (
    <main className="min-h-screen bg-[#050509] px-4 py-8 text-neutral-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-white/10 bg-base-900/70 p-6 shadow-2xl shadow-black/35 backdrop-blur-xl">
          <img src="/pulseroom-logo-transparent.png" alt="PULSEROOM" className="h-28 w-28 object-contain" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent-400">
            {isUpdate ? 'Mise à jour obligatoire' : 'Première connexion'}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-50">
            {isUpdate ? 'Nouveautés et conditions mises à jour' : 'Documents légaux à accepter'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
            {isUpdate
              ? 'Avant d’accéder à votre espace modèle, vous devez lire les nouveautés publiées cette semaine et accepter la version mise à jour des conditions PULSEROOM.'
              : 'Avant d’accéder à votre espace modèle, vous devez lire et accepter les conditions applicables à l’utilisation de PULSEROOM.'}
          </p>
          <p className="mt-3 text-xs text-neutral-500">Version des conditions : {LEGAL_TERMS_VERSION}</p>
        </header>

        {weeklyUpdate ? (
          <section className="rounded-2xl border border-accent-400/25 bg-accent-500/10 p-6 shadow-2xl shadow-black/25">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-300">Nouveautés de la semaine</p>
            <h2 className="mt-2 text-2xl font-bold text-neutral-50">{weeklyUpdate.title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-300">{weeklyUpdate.summary}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-300">
              {weeklyUpdate.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-white/10 bg-base-900/80 p-6 backdrop-blur-xl">
            <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-50">Conditions générales complètes</h2>
                <p className="mt-1 text-xs text-neutral-500">Le PDF complet reprend ces conditions et les anciennes clauses encore applicables.</p>
              </div>
              <a href="/conditions-generales-pulseroom.pdf" target="_blank" rel="noreferrer" className="btn-secondary justify-center">
                Ouvrir le PDF
              </a>
            </div>
            <div className="max-h-[68vh] space-y-8 overflow-y-auto pr-2">
              {LEGAL_SECTIONS.map((section) => (
                <article key={section.title} className="space-y-4">
                  <h2 className="border-b border-white/10 pb-3 text-xl font-bold text-neutral-50">{section.title}</h2>
                  {section.blocks.map((block, index) => (
                    <div key={`${section.title}-${index}`} className="space-y-2 text-sm leading-6 text-neutral-300">
                      {block.heading ? <h3 className="text-base font-semibold text-neutral-100">{block.heading}</h3> : null}
                      {block.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {block.list ? (
                        <ul className="list-disc space-y-1 pl-5 text-neutral-400">
                          {block.list.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                      {block.footer ? <p>{block.footer}</p> : null}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </section>

          <LegalAcceptanceForm action={acceptLegalTerms} plan={params?.plan} trial={params?.trial} isUpdate={isUpdate} />
        </div>
      </div>
    </main>
  );
}
