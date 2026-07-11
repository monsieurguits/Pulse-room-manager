import Link from 'next/link';
import { LEGAL_TERMS_VERSION } from '@/lib/auth';
import { LEGAL_SECTIONS } from '@/lib/legal-content';

export const dynamic = 'force-dynamic';

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-base-950 px-4 py-8 text-neutral-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard/account" className="text-sm text-accent-400 hover:text-accent-300">
          Retour au compte
        </Link>
        <header className="mt-6 rounded-2xl border border-white/10 bg-base-900/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">PULSEROOM</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-50">Documents légaux</h1>
          <p className="mt-2 text-sm text-neutral-400">Version des conditions : {LEGAL_TERMS_VERSION}</p>
          <a href="/conditions-generales-pulseroom.pdf" target="_blank" rel="noreferrer" className="btn-secondary mt-4 inline-flex">
            Télécharger le PDF complet
          </a>
        </header>

        <div className="mt-6 space-y-6">
          {LEGAL_SECTIONS.map((section) => (
            <section key={section.title} className="card p-6">
              <h2 className="text-xl font-bold text-neutral-50">{section.title}</h2>
              <div className="mt-5 space-y-5">
                {section.blocks.map((block, index) => (
                  <div key={`${section.title}-${index}`} className="space-y-2 text-sm leading-6 text-neutral-300">
                    {block.heading ? <h3 className="font-semibold text-neutral-100">{block.heading}</h3> : null}
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
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
