import { redirect } from 'next/navigation';
import { LegalAcceptanceForm } from '@/components/legal-acceptance-form';
import { LEGAL_TERMS_VERSION, hasAcceptedCurrentLegalTerms, requireAdmin } from '@/lib/auth';
import { acceptLegalTerms } from '@/server-actions/auth';

export const dynamic = 'force-dynamic';

const sections = [
  {
    title: "Conditions Générales d'Utilisation",
    blocks: [
      {
        heading: '1. Objet',
        body: [
          'PULSEROOM est une plateforme permettant à des créateurs de contenu majeurs de gérer leurs appareils compatibles Lovense, leurs membres et leurs sessions de contrôle.',
        ],
      },
      {
        heading: "2. Conditions d'accès",
        body: [
          "L'utilisation de PULSEROOM est strictement réservée aux personnes majeures (18 ans ou plus, ou l'âge légal dans leur pays).",
          "L'utilisateur garantit que toutes les informations fournies sont exactes.",
        ],
      },
      {
        heading: '3. Responsabilité',
        body: ["L'utilisateur est seul responsable :"],
        list: [
          "de l'utilisation de son compte ;",
          'de ses appareils ;',
          'des interactions avec ses abonnés ;',
          'du respect des lois applicables dans son pays.',
        ],
        footer:
          "PULSEROOM ne peut être tenu responsable des pertes financières, d'une mauvaise utilisation ou d'une interruption de service.",
      },
      {
        heading: '4. Utilisation du service',
        body: ['Il est interdit :'],
        list: [
          "d'utiliser le service à des fins illégales ;",
          "de tenter d'accéder aux comptes d'autres utilisateurs ;",
          'de perturber le fonctionnement de la plateforme ;',
          'de diffuser des contenus interdits par la loi.',
        ],
        footer: 'Tout abus pourra entraîner la suspension ou la suppression du compte.',
      },
      {
        heading: '5. Disponibilité',
        body: [
          'Nous faisons notre possible pour assurer un fonctionnement continu, mais aucune disponibilité permanente ne peut être garantie.',
          'Des opérations de maintenance ou des incidents techniques peuvent entraîner une interruption temporaire du service.',
        ],
      },
      {
        heading: '6. Données personnelles',
        body: [
          'Les données sont utilisées uniquement pour le fonctionnement de la plateforme.',
          'Elles ne sont ni revendues ni cédées à des tiers, sauf obligation légale.',
          "L'utilisateur peut demander la suppression de ses données conformément à la réglementation applicable.",
        ],
      },
      {
        heading: '7. Propriété intellectuelle',
        body: [
          'Le logiciel PULSEROOM, son interface, son logo, son code source et son identité visuelle sont protégés.',
          'Toute reproduction, copie ou redistribution sans autorisation est interdite.',
        ],
      },
      {
        heading: '8. Résiliation',
        body: ['Nous pouvons suspendre ou supprimer un compte en cas de non-respect des présentes conditions.'],
      },
      {
        heading: '9. Modification des conditions',
        body: [
          'Les présentes conditions peuvent évoluer.',
          "La poursuite de l'utilisation du service vaut acceptation de la nouvelle version.",
        ],
      },
    ],
  },
  {
    title: 'Politique de confidentialité / RGPD',
    blocks: [
      {
        body: [
          'PULSEROOM collecte uniquement les données nécessaires au fonctionnement du service.',
          'Ces données peuvent comprendre :',
        ],
        list: [
          'adresse e-mail ;',
          'pseudonyme ;',
          'informations relatives aux appareils Lovense ;',
          'paramètres du compte ;',
          'journaux techniques nécessaires au fonctionnement.',
        ],
        footer:
          "Les données sont stockées de manière sécurisée. L'utilisateur peut demander leur suppression à tout moment.",
      },
    ],
  },
  {
    title: 'Mentions légales',
    blocks: [
      {
        body: [
          "PULSEROOM est édité et exploité par le propriétaire de la plateforme. Les informations légales complètes de l'éditeur doivent être communiquées aux utilisateurs selon le pays d'exploitation.",
          "Pour toute demande relative au compte, aux données personnelles ou au service, l'utilisateur doit contacter le support indiqué par le propriétaire de la plateforme.",
        ],
      },
    ],
  },
  {
    title: 'Conditions de vente',
    blocks: [
      {
        heading: 'Si abonnement',
        body: ['Les abonnements sont facturés selon le tarif affiché lors de la souscription.', 'Sauf mention contraire :'],
        list: [
          'les abonnements sont renouvelés automatiquement ;',
          "l'utilisateur peut résilier à tout moment ;",
          "aucun remboursement n'est effectué pour une période déjà commencée, sauf obligation légale.",
        ],
      },
    ],
  },
];

export default async function LegalAcceptPage() {
  const admin = await requireAdmin();

  if (admin.role !== 'MODEL' || hasAcceptedCurrentLegalTerms(admin)) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#050509] px-4 py-8 text-neutral-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-white/10 bg-base-900/70 p-6 shadow-2xl shadow-black/35 backdrop-blur-xl">
          <img src="/pulseroom-logo-transparent.png" alt="PULSEROOM" className="h-28 w-28 object-contain" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent-400">Première connexion</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-50">Documents légaux à accepter</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
            Avant d&apos;accéder à votre espace modèle, vous devez lire et accepter les conditions applicables à
            l&apos;utilisation de PULSEROOM.
          </p>
          <p className="mt-3 text-xs text-neutral-500">Version des conditions : {LEGAL_TERMS_VERSION}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-white/10 bg-base-900/80 p-6 backdrop-blur-xl">
            <div className="max-h-[68vh] space-y-8 overflow-y-auto pr-2">
              {sections.map((section) => (
                <article key={section.title} className="space-y-4">
                  <h2 className="border-b border-white/10 pb-3 text-xl font-bold text-neutral-50">{section.title}</h2>
                  {section.blocks.map((block, index) => (
                    <div key={`${section.title}-${index}`} className="space-y-2 text-sm leading-6 text-neutral-300">
                      {'heading' in block && block.heading && (
                        <h3 className="text-base font-semibold text-neutral-100">{block.heading}</h3>
                      )}
                      {block.body?.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {'list' in block && block.list && (
                        <ul className="list-disc space-y-1 pl-5 text-neutral-400">
                          {block.list.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {'footer' in block && block.footer && <p>{block.footer}</p>}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </section>

          <LegalAcceptanceForm action={acceptLegalTerms} />
        </div>
      </div>
    </main>
  );
}
