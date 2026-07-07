import Link from 'next/link';
import { LEGAL_TERMS_VERSION } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const sections = [
  {
    title: "Conditions Générales d'Utilisation",
    content: [
      ['1. Objet', ['PULSEROOM est une plateforme permettant à des créateurs de contenu majeurs de gérer leurs appareils compatibles Lovense, leurs membres et leurs sessions de contrôle.']],
      [
        "2. Conditions d'accès",
        [
          "L'utilisation de PULSEROOM est strictement réservée aux personnes majeures (18 ans ou plus, ou l'âge légal dans leur pays).",
          "L'utilisateur garantit que toutes les informations fournies sont exactes.",
        ],
      ],
      [
        '3. Responsabilité',
        [
          "L'utilisateur est seul responsable de l'utilisation de son compte, de ses appareils, des interactions avec ses abonnés et du respect des lois applicables dans son pays.",
          "PULSEROOM ne peut être tenu responsable des pertes financières, d'une mauvaise utilisation ou d'une interruption de service.",
        ],
      ],
      [
        '4. Utilisation du service',
        [
          "Il est interdit d'utiliser le service à des fins illégales, de tenter d'accéder aux comptes d'autres utilisateurs, de perturber le fonctionnement de la plateforme ou de diffuser des contenus interdits par la loi.",
          'Tout abus pourra entraîner la suspension ou la suppression du compte.',
        ],
      ],
      [
        '5. Disponibilité',
        [
          'Nous faisons notre possible pour assurer un fonctionnement continu, mais aucune disponibilité permanente ne peut être garantie.',
          'Des opérations de maintenance ou des incidents techniques peuvent entraîner une interruption temporaire du service.',
        ],
      ],
      [
        '6. Données personnelles',
        [
          'Les données sont utilisées uniquement pour le fonctionnement de la plateforme.',
          'Elles ne sont ni revendues ni cédées à des tiers, sauf obligation légale.',
          "L'utilisateur peut demander la suppression de ses données conformément à la réglementation applicable.",
        ],
      ],
      [
        '7. Propriété intellectuelle',
        [
          'Le logiciel PULSEROOM, son interface, son logo, son code source et son identité visuelle sont protégés.',
          'Toute reproduction, copie ou redistribution sans autorisation est interdite.',
        ],
      ],
      ['8. Résiliation', ['Nous pouvons suspendre ou supprimer un compte en cas de non-respect des présentes conditions.']],
      [
        '9. Modification des conditions',
        ['Les présentes conditions peuvent évoluer.', "La poursuite de l'utilisation du service vaut acceptation de la nouvelle version."],
      ],
    ],
  },
  {
    title: 'Politique de confidentialité / RGPD',
    content: [
      [
        '',
        [
          'PULSEROOM collecte uniquement les données nécessaires au fonctionnement du service.',
          'Ces données peuvent comprendre : adresse e-mail, pseudonyme, informations relatives aux appareils Lovense, paramètres du compte et journaux techniques nécessaires au fonctionnement.',
          "Les données sont stockées de manière sécurisée. L'utilisateur peut demander leur suppression à tout moment.",
        ],
      ],
    ],
  },
  {
    title: 'Mentions légales',
    content: [
      [
        '',
        [
          "PULSEROOM est édité et exploité par le propriétaire de la plateforme. Les informations légales complètes de l'éditeur doivent être communiquées aux utilisateurs selon le pays d'exploitation.",
          "Pour toute demande relative au compte, aux données personnelles ou au service, l'utilisateur doit contacter le support indiqué par le propriétaire de la plateforme.",
        ],
      ],
    ],
  },
  {
    title: 'Conditions de vente',
    content: [
      [
        'Si abonnement',
        [
          'Les abonnements sont facturés selon le tarif affiché lors de la souscription.',
          "Sauf mention contraire, les abonnements sont renouvelés automatiquement, l'utilisateur peut résilier à tout moment, et aucun remboursement n'est effectué pour une période déjà commencée, sauf obligation légale.",
        ],
      ],
    ],
  },
] as const;

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
        </header>

        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="card p-6">
              <h2 className="text-xl font-bold text-neutral-50">{section.title}</h2>
              <div className="mt-5 space-y-5">
                {section.content.map(([heading, paragraphs], index) => (
                  <div key={`${section.title}-${index}`} className="space-y-2 text-sm leading-6 text-neutral-300">
                    {heading && <h3 className="font-semibold text-neutral-100">{heading}</h3>}
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
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
