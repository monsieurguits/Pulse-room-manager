export type LegalBlock = {
  heading?: string;
  body: string[];
  list?: string[];
  footer?: string;
};

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type WeeklyLegalUpdate = {
  version: string;
  title: string;
  summary: string;
  changes: string[];
};

export const BASE_LEGAL_TERMS_VERSION = '2026-07-07';

export const LEGAL_SECTIONS: LegalSection[] = [
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
          'des informations personnelles, privées ou bancaires qu’il choisit de communiquer dans les espaces de message.',
        ],
        footer:
          "PULSEROOM ne peut être tenu responsable des pertes financières, d'une mauvaise utilisation, d'une interruption de service ou des informations communiquées volontairement entre utilisateurs.",
      },
      {
        heading: '4. Utilisation du service',
        body: ['Il est interdit :'],
        list: [
          "d'utiliser le service à des fins illégales ;",
          "de tenter d'accéder aux comptes d'autres utilisateurs ;",
          'de perturber le fonctionnement de la plateforme ;',
          'de diffuser des contenus interdits par la loi ;',
          'de partager des informations personnelles sensibles dans les messages ou espaces de conversation.',
        ],
        footer: 'Tout abus pourra entraîner la suspension ou la suppression du compte.',
      },
      {
        heading: '5. Disponibilité',
        body: [
          'Nous faisons notre possible pour assurer un fonctionnement continu, mais aucune disponibilité permanente ne peut être garantie.',
          'Des opérations de maintenance, mises à jour ou incidents techniques peuvent entraîner une interruption temporaire du service.',
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
          'Lorsqu’une mise à jour importante est publiée, l’utilisateur peut être invité à lire les nouveautés et à accepter la version mise à jour avant de continuer à utiliser son espace.',
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
          'messages échangés via la messagerie PULSEROOM ;',
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
      {
        heading: 'Achat de crédits membres',
        body: [
          'Les membres peuvent acheter des crédits additionnels lorsque cette option est proposée dans leur espace.',
          'Les crédits ajoutés après paiement sont rattachés au compte membre concerné et utilisables selon les règles du service.',
        ],
      },
    ],
  },
];

export const WEEKLY_LEGAL_UPDATES: WeeklyLegalUpdate[] = [
  {
    version: 'weekly-2026-07-05',
    title: 'Mises à jour de la semaine du 5 juillet 2026',
    summary:
      'Cette version informe les utilisateurs des dernières évolutions PULSEROOM déployées cette semaine et met à jour les règles applicables.',
    changes: [
      'Ajout d’une messagerie directe entre les membres et leur modèle.',
      'Ajout d’une recherche de membres par pseudo pour démarrer une conversation entre membres du même espace modèle.',
      'Ajout d’un rappel professionnel indiquant de ne jamais communiquer d’informations personnelles, bancaires ou privées dans les messages.',
      'Mise à jour des conditions relatives aux messages, à la confidentialité et à la responsabilité des informations partagées entre utilisateurs.',
      'Ajout d’un système d’acceptation obligatoire des nouveautés avant l’accès à l’espace lorsque les conditions évoluent.',
    ],
  },
];

export function getParisWeeklyVersion(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekday = weekdayMap[get('weekday')] ?? 0;
  const beforeSundayRelease = weekday === 0 && hour === 0 && minute === 0;
  const daysToSubtract = beforeSundayRelease ? 7 : weekday;
  const releaseDate = new Date(Date.UTC(year, month - 1, day - daysToSubtract));
  return `weekly-${releaseDate.toISOString().slice(0, 10)}`;
}

export function getCurrentLegalTermsVersion(date = new Date()): string {
  const weeklyVersion = getParisWeeklyVersion(date);
  return WEEKLY_LEGAL_UPDATES.some((update) => update.version === weeklyVersion) ? weeklyVersion : BASE_LEGAL_TERMS_VERSION;
}

export function getCurrentWeeklyLegalUpdate(date = new Date()): WeeklyLegalUpdate | null {
  const version = getCurrentLegalTermsVersion(date);
  return WEEKLY_LEGAL_UPDATES.find((update) => update.version === version) ?? null;
}
