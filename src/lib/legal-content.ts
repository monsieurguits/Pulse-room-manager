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
          'PULSEROOM est une plateforme professionnelle destinée aux créateurs de contenu majeurs, modèles, diffuseurs et administrateurs autorisés. Elle permet de gérer des membres, des crédits de contrôle, des sessions de contrôle d’appareils compatibles Lovense, des messages, des overlays OBS, des documents d’aide et des paramètres techniques liés à l’activité du compte.',
          'Le service ne fournit pas de service de diffusion vidéo, de plateforme de paiement bancaire complète, de conseil juridique, médical ou fiscal. Il met à disposition des outils techniques permettant d’organiser l’accès et l’utilisation d’appareils connectés compatibles.',
        ],
      },
      {
        heading: "2. Conditions d'accès",
        body: [
          "L'utilisation de PULSEROOM est strictement réservée aux personnes majeures, âgées de 18 ans ou plus, ou de l'âge légal requis dans leur pays de résidence si celui-ci est supérieur.",
          'Chaque utilisateur confirme disposer de la capacité légale, de l’autorisation et du consentement nécessaires pour utiliser le service. Toute utilisation par un mineur, pour un mineur, ou impliquant directement ou indirectement un mineur est strictement interdite.',
          "L'utilisateur garantit que les informations fournies sont exactes, complètes et maintenues à jour, notamment son adresse e-mail, son pseudonyme, son rôle, sa ville météo, ses informations de compte, ses paramètres Lovense et ses informations de paiement lorsqu'elles sont nécessaires.",
          'Le modèle ou administrateur est responsable de la création, de la gestion et de la suppression des accès membres liés à son espace.',
        ],
      },
      {
        heading: '3. Sécurité, consentement et utilisation des appareils',
        body: [
          'L’utilisation d’un appareil connecté implique un consentement libre, clair, volontaire et révocable à tout moment. Le modèle doit pouvoir interrompre l’utilisation de son appareil à tout moment et doit rester maître de son environnement, de ses limites et de sa sécurité personnelle.',
          'Chaque membre s’engage à utiliser les contrôles mis à sa disposition de manière raisonnable, respectueuse et conforme aux limites fixées par le modèle. Toute tentative de contournement des limites de durée, de crédit, d’intensité ou de contrôle est interdite.',
          'PULSEROOM ne garantit pas le fonctionnement continu des appareils, de l’application Lovense Connect, de l’application Lovense Remote, des API Lovense, des réseaux internet, des plateformes tierces ou des équipements personnels utilisés par les utilisateurs.',
        ],
      },
      {
        heading: '4. Responsabilité de l’utilisateur',
        body: ["L'utilisateur est seul responsable :"],
        list: [
          "de l'utilisation de son compte ;",
          'de la confidentialité de ses identifiants, codes d’accès, liens membres, QR codes et mots de passe ;',
          'de ses appareils, de leur état, de leur connexion, de leur batterie, de leur compatibilité et de leur utilisation ;',
          'des interactions avec ses abonnés, membres, modèles, plateformes de diffusion et services tiers ;',
          'du respect des lois applicables dans son pays, notamment en matière de majorité, consentement, contenus adultes, fiscalité, consommation, protection des données et droit des plateformes utilisées ;',
          'des informations personnelles, privées, bancaires, intimes ou sensibles qu’il choisit de communiquer dans les messages, formulaires, lives ou espaces de conversation ;',
          'des revenus, déclarations, abonnements, crédits, remboursements, commissions ou obligations fiscales liés à son activité.',
        ],
        footer:
          "PULSEROOM ne peut être tenu responsable des pertes financières, d'une mauvaise utilisation, d'une interruption de service, d’un défaut de connexion Lovense, d’un blocage par une plateforme tierce, d’un litige entre utilisateurs ou des informations communiquées volontairement entre utilisateurs.",
      },
      {
        heading: '5. Utilisation interdite du service',
        body: ['Il est interdit :'],
        list: [
          "d'utiliser le service à des fins illégales ;",
          'd’utiliser le service pour organiser, promouvoir ou faciliter une activité impliquant une personne mineure ;',
          "de tenter d'accéder aux comptes d'autres utilisateurs ;",
          'de partager, revendre, publier ou diffuser un lien membre, un code membre, un QR code, un token, une URL OBS ou un accès privé sans autorisation ;',
          'de perturber le fonctionnement de la plateforme ;',
          'de contourner les limites de crédits, d’intensité, de durée, de session ou de paiement ;',
          'de diffuser des contenus interdits par la loi ;',
          'de partager des informations personnelles sensibles dans les messages ou espaces de conversation ;',
          'de harceler, menacer, faire pression, manipuler ou inciter un utilisateur à dépasser ses limites personnelles.',
        ],
        footer: 'Tout abus pourra entraîner la suspension ou la suppression du compte.',
      },
      {
        heading: '6. Comptes, rôles et accès',
        body: [
          'PULSEROOM distingue plusieurs types d’accès : propriétaire, administrateur, modèle et membre. Les droits disponibles dépendent du rôle attribué au compte.',
          'Le propriétaire ou grand administrateur peut créer, modifier, suspendre, supprimer ou promouvoir certains comptes selon les fonctions disponibles. Le modèle peut gérer les membres rattachés à son espace et certains paramètres de son activité.',
          'Les membres accèdent à leur espace via un code personnel, un lien sécurisé ou toute méthode proposée par la plateforme. Ces accès sont strictement personnels et ne doivent pas être partagés.',
        ],
      },
      {
        heading: '7. Messagerie et communications',
        body: [
          'La messagerie PULSEROOM permet des échanges entre membres, modèles et support selon les droits configurés. Les messages doivent rester respectueux, nécessaires au fonctionnement du service et conformes à la loi.',
          'Il est fortement déconseillé de communiquer des informations personnelles, bancaires, documents d’identité, adresses, numéros de téléphone, données de localisation précises, informations médicales ou toute donnée intime non nécessaire dans la messagerie.',
          'PULSEROOM peut conserver les messages pour assurer le fonctionnement du service, permettre l’affichage des conversations, traiter une demande de support, prévenir les abus ou répondre à une obligation légale.',
        ],
      },
      {
        heading: '8. Disponibilité, maintenance et performances',
        body: [
          'Nous faisons notre possible pour assurer un fonctionnement continu, mais aucune disponibilité permanente ne peut être garantie.',
          'Des opérations de maintenance, mises à jour, incidents techniques, limitations de fournisseurs tiers, interruptions Vercel, Turso, Stripe, Resend, Lovense, réseau internet ou plateformes externes peuvent entraîner une interruption temporaire, une latence ou une indisponibilité partielle du service.',
          'Lorsqu’un mode maintenance est activé, un bandeau ou une fenêtre d’information peut être affiché afin de préciser la date, l’heure et l’impact prévu sur l’utilisation du site.',
        ],
      },
      {
        heading: '9. Données personnelles',
        body: [
          'Les données personnelles sont utilisées uniquement pour fournir, sécuriser, maintenir, facturer, améliorer et administrer PULSEROOM.',
          'Elles ne sont pas revendues. Elles peuvent être transmises à des prestataires techniques strictement nécessaires au fonctionnement du service, ou aux autorités compétentes en cas d’obligation légale.',
          "L'utilisateur peut exercer ses droits conformément à la réglementation applicable, notamment par e-mail auprès du support.",
        ],
      },
      {
        heading: '10. Propriété intellectuelle',
        body: [
          'Le logiciel PULSEROOM, son interface, son logo, son code source et son identité visuelle sont protégés.',
          'Toute reproduction, copie ou redistribution sans autorisation est interdite.',
        ],
      },
      {
        heading: '11. Suspension, suppression et résiliation',
        body: [
          'Nous pouvons suspendre, limiter ou supprimer un compte en cas de non-respect des présentes conditions, d’utilisation abusive, de risque de sécurité, de suspicion de fraude, d’atteinte aux droits d’autrui, de non-paiement ou d’obligation légale.',
          'L’utilisateur peut demander la suppression de son compte et des données associées, sous réserve des données devant être conservées pour des raisons légales, comptables, contractuelles, de preuve ou de sécurité.',
        ],
      },
      {
        heading: '12. Modification des conditions',
        body: [
          'Les présentes conditions peuvent évoluer.',
          'Lorsqu’une mise à jour importante est publiée, l’utilisateur peut être invité à lire les nouveautés et à accepter la version mise à jour avant de continuer à utiliser son espace. La poursuite de l’utilisation du service après acceptation vaut accord sur la version applicable.',
        ],
      },
    ],
  },
  {
    title: 'Politique de confidentialité / RGPD',
    blocks: [
      {
        heading: '1. Responsable de traitement et contact',
        body: [
          'Le responsable de traitement est l’éditeur de PULSEROOM, sous réserve des informations légales définitives renseignées dans les mentions légales du service.',
          'Pour toute demande relative aux données personnelles, à l’exercice des droits RGPD, à la confidentialité ou à la suppression d’un compte, l’utilisateur peut contacter : contact@pulse-room.app.',
          'Cette politique est rédigée pour informer les utilisateurs de manière claire, accessible et transparente sur les traitements réalisés par PULSEROOM.',
        ],
      },
      {
        heading: '2. Données collectées',
        body: ['Selon le rôle de l’utilisateur et les fonctionnalités utilisées, PULSEROOM peut traiter les catégories de données suivantes :'],
        list: [
          'données d’identification : adresse e-mail, pseudonyme, prénom, nom, rôle, sexe renseigné, date de naissance, statut du compte ;',
          'données de connexion et sécurité : mot de passe chiffré, dates de création et mise à jour, acceptation légale, version acceptée, sessions ouvertes, journaux techniques, erreurs et événements nécessaires au diagnostic ;',
          'données membres : pseudonyme, adresse e-mail facultative ou renseignée, plateforme d’origine, code d’accès, lien sécurisé, dates de début et fin d’accès, crédit hebdomadaire, crédit restant, historique des sessions et achats ;',
          'données Lovense : identifiants techniques d’appairage, QR codes, domaines de connexion, ports, statut de connexion, nom du jouet, type de jouet, identifiants de jouets, informations techniques retournées par Lovense ;',
          'données de contrôle : démarrage, arrêt, intensité, patterns, durée, file d’attente, commandes de tips, événements d’overlay et courbe de puissance ;',
          'données de messagerie : conversations, contenus des messages, dates d’envoi, expéditeurs, destinataires, statut de lecture et notifications ;',
          'données de paiement : plan choisi, achat de crédits, montant, devise, statut de paiement, identifiants Stripe, historique d’achat, commissions et revenus liés au modèle ;',
          'données météo : ville renseignée, température utilisée pour afficher les messages personnalisés du tableau de bord ou de l’espace membre ;',
          'données de support et formulaires : nom, prénom, pseudo, e-mail, plateformes utilisées, message libre, consentement à être contacté ;',
          'données d’e-mail transactionnel : adresse destinataire, contenu technique nécessaire à l’envoi, statut d’envoi, échec, bounce ou confirmation fournisseur.',
        ],
      },
      {
        heading: '3. Finalités des traitements',
        body: ['Les données sont traitées pour les finalités suivantes :'],
        list: [
          'création, authentification, sécurisation et gestion des comptes ;',
          'gestion des membres, crédits, accès, codes, liens sécurisés et dates d’expiration ;',
          'connexion, appairage, contrôle et supervision technique des appareils compatibles Lovense ;',
          'affichage des tableaux de bord, statuts, météo, overlays OBS et notifications ;',
          'gestion des messages entre membres, modèles, administrateurs et support ;',
          'envoi d’e-mails transactionnels : création de compte, réinitialisation de code, modification de mot de passe, support et notifications nécessaires ;',
          'gestion des abonnements, essais gratuits, paiements, crédits, historiques d’achat, commissions et revenus ;',
          'maintenance, journalisation technique, prévention des fraudes, sécurité, correction des bugs et amélioration du service ;',
          'respect des obligations légales, contractuelles, comptables, fiscales et de preuve.',
        ],
      },
      {
        heading: '4. Bases légales',
        body: ['Selon les traitements, PULSEROOM s’appuie sur les bases légales suivantes :'],
        list: [
          'exécution du contrat ou de mesures précontractuelles pour fournir le compte, les accès, les crédits, les sessions et les fonctionnalités demandées ;',
          'consentement lorsque l’utilisateur accepte les conditions, souhaite être contacté, renseigne certaines informations facultatives ou utilise volontairement certaines fonctionnalités ;',
          'intérêt légitime pour sécuriser le service, prévenir les abus, maintenir les journaux techniques, améliorer la plateforme et traiter le support ;',
          'obligation légale pour les données devant être conservées en matière comptable, fiscale, judiciaire, sécurité ou réponse aux autorités compétentes.',
        ],
      },
      {
        heading: '5. Destinataires et sous-traitants',
        body: [
          'Les données sont accessibles uniquement aux personnes et prestataires ayant besoin d’y accéder pour fournir le service, dans la limite de leurs missions.',
          'Les prestataires peuvent notamment inclure l’hébergement, la base de données, l’envoi d’e-mails, le paiement, la connexion Lovense, les services météo, l’analyse technique et les outils de déploiement.',
        ],
        list: [
          'Vercel pour l’hébergement et l’exécution de l’application ;',
          'Turso ou le fournisseur de base de données configuré pour le stockage applicatif ;',
          'Lovense pour l’appairage, la connexion et l’envoi des commandes aux appareils compatibles ;',
          'Stripe pour les paiements, abonnements, crédits, commissions et données nécessaires au paiement ;',
          'Resend ou le fournisseur e-mail configuré pour les e-mails transactionnels ;',
          'fournisseurs météo utilisés pour les messages personnalisés lorsque la fonctionnalité est activée ;',
          'GitHub et Vercel pour le déploiement et la maintenance technique du service.',
        ],
        footer:
          'Ces prestataires peuvent traiter certaines données hors de l’Union européenne selon leur propre infrastructure. Lorsque cela est applicable, les transferts doivent être encadrés par des garanties reconnues par le RGPD.',
      },
      {
        heading: '6. Durées de conservation',
        body: [
          'Les données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont traitées, puis supprimées, anonymisées ou archivées lorsque cela est possible.',
          'À titre indicatif, les données de compte sont conservées tant que le compte est actif ; les données membres tant que l’accès est nécessaire ; les messages tant que la conversation ou le support le justifie ; les données de paiement pendant les durées imposées par les obligations comptables et fiscales ; les journaux techniques pendant une durée proportionnée à la sécurité et au diagnostic.',
          'Certaines données peuvent être conservées plus longtemps si cela est nécessaire pour respecter une obligation légale, prévenir une fraude, résoudre un litige, établir une preuve ou protéger les droits de PULSEROOM, d’un utilisateur ou d’un tiers.',
        ],
      },
      {
        heading: '7. Droits des personnes',
        body: ['Conformément au RGPD, l’utilisateur peut demander, selon les cas :'],
        list: [
          'l’accès aux données le concernant ;',
          'la rectification des données inexactes ou incomplètes ;',
          'l’effacement des données lorsque les conditions légales sont réunies ;',
          'la limitation du traitement ;',
          'l’opposition à certains traitements fondés sur l’intérêt légitime ;',
          'la portabilité des données fournies lorsque cela est applicable ;',
          'le retrait d’un consentement lorsque le traitement repose sur celui-ci.',
        ],
        footer:
          'Les demandes peuvent être adressées à contact@pulse-room.app. Une vérification d’identité peut être demandée afin d’éviter la communication de données à un tiers non autorisé. L’utilisateur peut également introduire une réclamation auprès de l’autorité de protection des données compétente.',
      },
      {
        heading: '8. Sécurité et confidentialité',
        body: [
          'PULSEROOM met en œuvre des mesures techniques et organisationnelles destinées à protéger les données contre l’accès non autorisé, la perte, l’altération, la divulgation ou l’utilisation abusive.',
          'Ces mesures peuvent inclure le chiffrement des mots de passe, des accès restreints, des liens et tokens sécurisés, des contrôles de rôle, des journaux techniques, des sauvegardes ou mécanismes de restauration selon l’infrastructure utilisée.',
          'Aucune méthode de transmission ou de stockage n’étant infaillible, PULSEROOM ne peut garantir une sécurité absolue. L’utilisateur doit utiliser un mot de passe solide, ne pas partager ses accès et signaler rapidement toute suspicion de compromission.',
        ],
      },
      {
        heading: '9. Cookies, sessions et stockage local',
        body: [
          'PULSEROOM peut utiliser des cookies ou mécanismes équivalents strictement nécessaires à l’authentification, la sécurité, la navigation, la conservation de session et le fonctionnement du site.',
          'Si des cookies non strictement nécessaires sont ajoutés ultérieurement, une information ou un mécanisme de choix adapté devra être proposé selon la réglementation applicable.',
        ],
      },
      {
        heading: '10. Données sensibles et précautions particulières',
        body: [
          'PULSEROOM n’a pas vocation à collecter des données médicales, documents d’identité, adresses personnelles détaillées, coordonnées bancaires hors prestataire de paiement, contenus intimes privés ou informations sensibles non nécessaires au service.',
          'Compte tenu de la nature adulte et connectée du service, les utilisateurs doivent limiter les informations partagées au strict nécessaire, ne jamais communiquer d’informations personnelles dans les messages et respecter la vie privée des autres utilisateurs.',
        ],
      },
      {
        heading: '11. Violation de données',
        body: [
          'En cas de violation de données personnelles susceptible d’engendrer un risque pour les droits et libertés des personnes, PULSEROOM prendra les mesures raisonnables pour analyser l’incident, le limiter, le corriger et, lorsque la loi l’exige, informer les personnes concernées ou l’autorité compétente.',
        ],
      },
    ],
  },
  {
    title: 'Mentions légales',
    blocks: [
      {
        heading: '1. Éditeur du service',
        body: [
          'PULSEROOM est édité et exploité par le propriétaire de la plateforme. Les informations légales complètes de l’éditeur, notamment identité, adresse, forme juridique le cas échéant, responsable de publication et moyens de contact, doivent être complétées et tenues à jour par le propriétaire selon son pays d’exploitation.',
          'Contact support et données personnelles : contact@pulse-room.app.',
        ],
      },
      {
        heading: '2. Hébergement et fournisseurs techniques',
        body: [
          'Le site peut être hébergé par Vercel et utiliser des fournisseurs techniques tels que Turso, Stripe, Resend, Lovense, GitHub et tout autre prestataire nécessaire au fonctionnement configuré par le propriétaire.',
          'Les informations détaillées de ces prestataires doivent être consultées dans leurs propres conditions, politiques de confidentialité et documents contractuels.',
        ],
      },
      {
        heading: '3. Signalement',
        body: [
          'Toute demande relative au service, à un compte, à un contenu, à un problème technique, à la confidentialité ou à une suspicion d’abus doit être adressée au support.',
        ],
      },
    ],
  },
  {
    title: 'Conditions de vente',
    blocks: [
      {
        heading: '1. Abonnements modèles',
        body: [
          'Lorsque des abonnements modèles sont proposés, ils sont facturés selon le tarif, les avantages, la durée, les conditions d’essai et les modalités affichés lors de la souscription.',
          'Sauf mention contraire lors de l’achat, l’abonnement peut être renouvelé automatiquement et l’utilisateur peut demander sa résiliation selon les modalités indiquées dans son espace ou par le support.',
        ],
      },
      {
        heading: '2. Essai gratuit',
        body: [
          'Un essai gratuit peut être proposé temporairement. Il permet d’accéder aux fonctionnalités indiquées pendant la durée affichée. À l’issue de l’essai, certaines fonctions peuvent être limitées ou nécessiter un abonnement payant.',
        ],
      },
      {
        heading: '3. Achat de crédits membres',
        body: [
          'Les membres peuvent acheter des crédits additionnels lorsque cette option est proposée dans leur espace. Les crédits achetés sont ajoutés au compte membre concerné après confirmation du paiement par Stripe ou le prestataire de paiement configuré.',
          'Les crédits permettent d’utiliser les fonctionnalités de contrôle selon les règles du service, les limites du modèle, la disponibilité de l’appareil et l’état technique de la session.',
        ],
      },
      {
        heading: '4. Paiements, commissions et revenus',
        body: [
          'Les paiements peuvent être traités par Stripe. PULSEROOM ne stocke pas directement les coordonnées complètes de carte bancaire lorsque celles-ci sont saisies chez le prestataire de paiement.',
          'Lorsque Stripe Connect ou un système équivalent est utilisé, le modèle peut recevoir tout ou partie du montant selon la configuration, les commissions de plateforme, les frais Stripe, les taxes éventuelles et les règles applicables.',
        ],
      },
      {
        heading: '5. Remboursements et contestations',
        body: [
          'Sauf obligation légale contraire ou décision commerciale spécifique, aucun remboursement n’est dû pour une période déjà commencée, un crédit déjà consommé, un défaut lié à l’équipement personnel de l’utilisateur, une indisponibilité d’un service tiers ou une mauvaise utilisation du compte.',
          'Toute contestation de paiement, demande de remboursement ou anomalie doit être signalée au support dans un délai raisonnable avec les informations permettant d’identifier la transaction.',
        ],
      },
      {
        heading: '6. Taxes et obligations déclaratives',
        body: [
          'Chaque modèle ou utilisateur percevant des revenus via PULSEROOM reste responsable de ses déclarations fiscales, sociales, comptables et administratives selon sa situation et son pays.',
          'PULSEROOM ne fournit pas de conseil fiscal, social ou comptable.',
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
      'Mise à jour complète des CGU, de la politique de confidentialité RGPD, des mentions légales, des paiements, des crédits membres, des sous-traitants et des données traitées par PULSEROOM.',
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
