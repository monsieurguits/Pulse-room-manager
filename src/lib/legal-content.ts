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
    title: "Conditions Generales d'Utilisation",
    blocks: [
      {
        heading: '1. Objet',
        body: [
          'PULSEROOM est une plateforme professionnelle destinee aux createurs de contenu majeurs, modeles, diffuseurs et administrateurs autorises. Elle permet de gerer des membres, des credits de controle, des sessions de controle d’appareils compatibles Lovense, des messages, des overlays OBS, des documents d’aide et des parametres techniques lies a l’activite du compte.',
          'Le service ne fournit pas de service de diffusion video, de plateforme de paiement bancaire complete, de conseil juridique, medical ou fiscal. Il met a disposition des outils techniques permettant d’organiser l’acces et l’utilisation d’appareils connectes compatibles.',
        ],
      },
      {
        heading: "2. Conditions d'acces",
        body: [
          "L'utilisation de PULSEROOM est strictement reservee aux personnes majeures, agees de 18 ans ou plus, ou de l'age legal requis dans leur pays de residence si celui-ci est superieur.",
          'Chaque utilisateur confirme disposer de la capacite legale, de l’autorisation et du consentement necessaires pour utiliser le service. Toute utilisation par un mineur, pour un mineur, ou impliquant directement ou indirectement un mineur est strictement interdite.',
          "L'utilisateur garantit que les informations fournies sont exactes, completes et maintenues a jour, notamment son adresse e-mail, son pseudonyme, son role, sa ville meteo, ses informations de compte, ses parametres Lovense et ses informations de paiement lorsqu'elles sont necessaires.",
          'Le modele ou administrateur est responsable de la creation, de la gestion et de la suppression des acces membres lies a son espace.',
        ],
      },
      {
        heading: '3. Securite, consentement et utilisation des appareils',
        body: [
          'L’utilisation d’un appareil connecte implique un consentement libre, clair, volontaire et revocable a tout moment. Le modele doit pouvoir interrompre l’utilisation de son appareil a tout moment et doit rester maitre de son environnement, de ses limites et de sa securite personnelle.',
          'Chaque membre s’engage a utiliser les controles mis a sa disposition de maniere raisonnable, respectueuse et conforme aux limites fixees par le modele. Toute tentative de contournement des limites de duree, de credit, d’intensite ou de controle est interdite.',
          'PULSEROOM ne garantit pas le fonctionnement continu des appareils, de l’application Lovense Connect, de l’application Lovense Remote, des API Lovense, des reseaux internet, des plateformes tierces ou des equipements personnels utilises par les utilisateurs.',
        ],
      },
      {
        heading: '4. Responsabilite de l’utilisateur',
        body: ["L'utilisateur est seul responsable :"],
        list: [
          "de l'utilisation de son compte ;",
          'de la confidentialite de ses identifiants, codes d’acces, liens membres, QR codes et mots de passe ;',
          'de ses appareils, de leur etat, de leur connexion, de leur batterie, de leur compatibilite et de leur utilisation ;',
          'des interactions avec ses abonnes, membres, modeles, plateformes de diffusion et services tiers ;',
          'du respect des lois applicables dans son pays, notamment en matiere de majorite, consentement, contenus adultes, fiscalite, consommation, protection des donnees et droit des plateformes utilisees ;',
          'des informations personnelles, privees, bancaires, intimes ou sensibles qu’il choisit de communiquer dans les messages, formulaires, lives ou espaces de conversation ;',
          'des revenus, declarations, abonnements, credits, remboursements, commissions ou obligations fiscales lies a son activite.',
        ],
        footer:
          "PULSEROOM ne peut etre tenu responsable des pertes financieres, d'une mauvaise utilisation, d'une interruption de service, d’un defaut de connexion Lovense, d’un blocage par une plateforme tierce, d’un litige entre utilisateurs ou des informations communiquees volontairement entre utilisateurs.",
      },
      {
        heading: '5. Utilisation interdite du service',
        body: ['Il est interdit :'],
        list: [
          "d'utiliser le service a des fins illegales ;",
          'd’utiliser le service pour organiser, promouvoir ou faciliter une activite impliquant une personne mineure ;',
          "de tenter d'acceder aux comptes d'autres utilisateurs ;",
          'de partager, revendre, publier ou diffuser un lien membre, un code membre, un QR code, un token, une URL OBS ou un acces prive sans autorisation ;',
          'de perturber le fonctionnement de la plateforme ;',
          'de contourner les limites de credits, d’intensite, de duree, de session ou de paiement ;',
          'de diffuser des contenus interdits par la loi ;',
          'de partager des informations personnelles sensibles dans les messages ou espaces de conversation ;',
          'de harceler, menacer, faire pression, manipuler ou inciter un utilisateur a depasser ses limites personnelles.',
        ],
        footer: 'Tout abus pourra entrainer la suspension ou la suppression du compte.',
      },
      {
        heading: '6. Comptes, roles et acces',
        body: [
          'PULSEROOM distingue plusieurs types d’acces : proprietaire, administrateur, modele et membre. Les droits disponibles dependent du role attribue au compte.',
          'Le proprietaire ou grand administrateur peut creer, modifier, suspendre, supprimer ou promouvoir certains comptes selon les fonctions disponibles. Le modele peut gerer les membres rattaches a son espace et certains parametres de son activite.',
          'Les membres accedent a leur espace via un code personnel, un lien securise ou toute methode proposee par la plateforme. Ces acces sont strictement personnels et ne doivent pas etre partages.',
        ],
      },
      {
        heading: '7. Messagerie et communications',
        body: [
          'La messagerie PULSEROOM permet des echanges entre membres, modeles et support selon les droits configures. Les messages doivent rester respectueux, necessaires au fonctionnement du service et conformes a la loi.',
          'Il est fortement deconseille de communiquer des informations personnelles, bancaires, documents d’identite, adresses, numeros de telephone, donnees de localisation precises, informations medicales ou toute donnee intime non necessaire dans la messagerie.',
          'PULSEROOM peut conserver les messages pour assurer le fonctionnement du service, permettre l’affichage des conversations, traiter une demande de support, prevenir les abus ou repondre a une obligation legale.',
        ],
      },
      {
        heading: '8. Disponibilite, maintenance et performances',
        body: [
          'Nous faisons notre possible pour assurer un fonctionnement continu, mais aucune disponibilite permanente ne peut etre garantie.',
          'Des operations de maintenance, mises a jour, incidents techniques, limitations de fournisseurs tiers, interruptions Vercel, Turso, Stripe, Resend, Lovense, reseau internet ou plateformes externes peuvent entrainer une interruption temporaire, une latence ou une indisponibilite partielle du service.',
          'Lorsqu’un mode maintenance est active, un bandeau ou une fenetre d’information peut etre affiche afin de preciser la date, l’heure et l’impact prevu sur l’utilisation du site.',
        ],
      },
      {
        heading: '9. Donnees personnelles',
        body: [
          'Les donnees personnelles sont utilisees uniquement pour fournir, securiser, maintenir, facturer, ameliorer et administrer PULSEROOM.',
          'Elles ne sont pas revendues. Elles peuvent etre transmises a des prestataires techniques strictement necessaires au fonctionnement du service, ou aux autorites competentes en cas d’obligation legale.',
          "L'utilisateur peut exercer ses droits conformement a la reglementation applicable, notamment par e-mail aupres du support.",
        ],
      },
      {
        heading: '10. Propriete intellectuelle',
        body: [
          'Le logiciel PULSEROOM, son interface, son logo, son code source et son identite visuelle sont proteges.',
          'Toute reproduction, copie ou redistribution sans autorisation est interdite.',
        ],
      },
      {
        heading: '11. Suspension, suppression et resiliation',
        body: [
          'Nous pouvons suspendre, limiter ou supprimer un compte en cas de non-respect des presentes conditions, d’utilisation abusive, de risque de securite, de suspicion de fraude, d’atteinte aux droits d’autrui, de non-paiement ou d’obligation legale.',
          'L’utilisateur peut demander la suppression de son compte et des donnees associees, sous reserve des donnees devant etre conservees pour des raisons legales, comptables, contractuelles, de preuve ou de securite.',
        ],
      },
      {
        heading: '12. Modification des conditions',
        body: [
          'Les presentes conditions peuvent evoluer.',
          'Lorsqu’une mise a jour importante est publiee, l’utilisateur peut etre invite a lire les nouveautes et a accepter la version mise a jour avant de continuer a utiliser son espace. La poursuite de l’utilisation du service apres acceptation vaut accord sur la version applicable.',
        ],
      },
    ],
  },
  {
    title: 'Politique de confidentialite / RGPD',
    blocks: [
      {
        heading: '1. Responsable de traitement et contact',
        body: [
          'Le responsable de traitement est l’editeur de PULSEROOM, sous reserve des informations legales definitives renseignees dans les mentions legales du service.',
          'Pour toute demande relative aux donnees personnelles, a l’exercice des droits RGPD, a la confidentialite ou a la suppression d’un compte, l’utilisateur peut contacter : contact@pulse-room.app.',
          'Cette politique est redigee pour informer les utilisateurs de maniere claire, accessible et transparente sur les traitements realises par PULSEROOM.',
        ],
      },
      {
        heading: '2. Donnees collectees',
        body: ['Selon le role de l’utilisateur et les fonctionnalites utilisees, PULSEROOM peut traiter les categories de donnees suivantes :'],
        list: [
          'donnees d’identification : adresse e-mail, pseudonyme, prenom, nom, role, sexe renseigne, date de naissance, statut du compte ;',
          'donnees de connexion et securite : mot de passe chiffre, dates de creation et mise a jour, acceptation legale, version acceptee, sessions ouvertes, journaux techniques, erreurs et evenements necessaires au diagnostic ;',
          'donnees membres : pseudonyme, adresse e-mail facultative ou renseignee, plateforme d’origine, code d’acces, lien securise, dates de debut et fin d’acces, credit hebdomadaire, credit restant, historique des sessions et achats ;',
          'donnees Lovense : identifiants techniques d’appairage, QR codes, domaines de connexion, ports, statut de connexion, nom du jouet, type de jouet, identifiants de jouets, informations techniques retournees par Lovense ;',
          'donnees de controle : demarrage, arret, intensite, patterns, duree, file d’attente, commandes de tips, evenements d’overlay et courbe de puissance ;',
          'donnees de messagerie : conversations, contenus des messages, dates d’envoi, expediteurs, destinataires, statut de lecture et notifications ;',
          'donnees de paiement : plan choisi, achat de credits, montant, devise, statut de paiement, identifiants Stripe, historique d’achat, commissions et revenus lies au modele ;',
          'donnees meteo : ville renseignee, temperature utilisee pour afficher les messages personnalises du tableau de bord ou de l’espace membre ;',
          'donnees de support et formulaires : nom, prenom, pseudo, e-mail, plateformes utilisees, message libre, consentement a etre contacte ;',
          'donnees d’e-mail transactionnel : adresse destinataire, contenu technique necessaire a l’envoi, statut d’envoi, echec, bounce ou confirmation fournisseur.',
        ],
      },
      {
        heading: '3. Finalites des traitements',
        body: ['Les donnees sont traitees pour les finalites suivantes :'],
        list: [
          'creation, authentification, securisation et gestion des comptes ;',
          'gestion des membres, credits, acces, codes, liens securises et dates d’expiration ;',
          'connexion, appairage, controle et supervision technique des appareils compatibles Lovense ;',
          'affichage des tableaux de bord, statuts, meteo, overlays OBS et notifications ;',
          'gestion des messages entre membres, modeles, administrateurs et support ;',
          'envoi d’e-mails transactionnels : creation de compte, reinitialisation de code, modification de mot de passe, support et notifications necessaires ;',
          'gestion des abonnements, essais gratuits, paiements, credits, historiques d’achat, commissions et revenus ;',
          'maintenance, journalisation technique, prevention des fraudes, securite, correction des bugs et amelioration du service ;',
          'respect des obligations legales, contractuelles, comptables, fiscales et de preuve.',
        ],
      },
      {
        heading: '4. Bases legales',
        body: ['Selon les traitements, PULSEROOM s’appuie sur les bases legales suivantes :'],
        list: [
          'execution du contrat ou de mesures precontractuelles pour fournir le compte, les acces, les credits, les sessions et les fonctionnalites demandees ;',
          'consentement lorsque l’utilisateur accepte les conditions, souhaite etre contacte, renseigne certaines informations facultatives ou utilise volontairement certaines fonctionnalites ;',
          'interet legitime pour securiser le service, prevenir les abus, maintenir les journaux techniques, ameliorer la plateforme et traiter le support ;',
          'obligation legale pour les donnees devant etre conservees en matiere comptable, fiscale, judiciaire, securite ou reponse aux autorites competentes.',
        ],
      },
      {
        heading: '5. Destinataires et sous-traitants',
        body: [
          'Les donnees sont accessibles uniquement aux personnes et prestataires ayant besoin d’y acceder pour fournir le service, dans la limite de leurs missions.',
          'Les prestataires peuvent notamment inclure l’hebergement, la base de donnees, l’envoi d’e-mails, le paiement, la connexion Lovense, les services meteo, l’analyse technique et les outils de deploiement.',
        ],
        list: [
          'Vercel pour l’hebergement et l’execution de l’application ;',
          'Turso ou le fournisseur de base de donnees configure pour le stockage applicatif ;',
          'Lovense pour l’appairage, la connexion et l’envoi des commandes aux appareils compatibles ;',
          'Stripe pour les paiements, abonnements, credits, commissions et donnees necessaires au paiement ;',
          'Resend ou le fournisseur e-mail configure pour les e-mails transactionnels ;',
          'fournisseurs meteo utilises pour les messages personnalises lorsque la fonctionnalite est activee ;',
          'GitHub et Vercel pour le deploiement et la maintenance technique du service.',
        ],
        footer:
          'Ces prestataires peuvent traiter certaines donnees hors de l’Union europeenne selon leur propre infrastructure. Lorsque cela est applicable, les transferts doivent etre encadres par des garanties reconnues par le RGPD.',
      },
      {
        heading: '6. Durees de conservation',
        body: [
          'Les donnees sont conservees pendant la duree necessaire aux finalites pour lesquelles elles sont traitees, puis supprimees, anonymisees ou archivees lorsque cela est possible.',
          'A titre indicatif, les donnees de compte sont conservees tant que le compte est actif ; les donnees membres tant que l’acces est necessaire ; les messages tant que la conversation ou le support le justifie ; les donnees de paiement pendant les durees imposees par les obligations comptables et fiscales ; les journaux techniques pendant une duree proportionnee a la securite et au diagnostic.',
          'Certaines donnees peuvent etre conservees plus longtemps si cela est necessaire pour respecter une obligation legale, prevenir une fraude, resoudre un litige, etablir une preuve ou proteger les droits de PULSEROOM, d’un utilisateur ou d’un tiers.',
        ],
      },
      {
        heading: '7. Droits des personnes',
        body: ['Conformement au RGPD, l’utilisateur peut demander, selon les cas :'],
        list: [
          'l’acces aux donnees le concernant ;',
          'la rectification des donnees inexactes ou incompletes ;',
          'l’effacement des donnees lorsque les conditions legales sont reunies ;',
          'la limitation du traitement ;',
          'l’opposition a certains traitements fondes sur l’interet legitime ;',
          'la portabilite des donnees fournies lorsque cela est applicable ;',
          'le retrait d’un consentement lorsque le traitement repose sur celui-ci.',
        ],
        footer:
          'Les demandes peuvent etre adressees a contact@pulse-room.app. Une verification d’identite peut etre demandee afin d’eviter la communication de donnees a un tiers non autorise. L’utilisateur peut egalement introduire une reclamation aupres de l’autorite de protection des donnees competente.',
      },
      {
        heading: '8. Securite et confidentialite',
        body: [
          'PULSEROOM met en oeuvre des mesures techniques et organisationnelles destinees a proteger les donnees contre l’acces non autorise, la perte, l’alteration, la divulgation ou l’utilisation abusive.',
          'Ces mesures peuvent inclure le chiffrement des mots de passe, des acces restreints, des liens et tokens securises, des controles de role, des journaux techniques, des sauvegardes ou mecanismes de restauration selon l’infrastructure utilisee.',
          'Aucune methode de transmission ou de stockage n’etant infaillible, PULSEROOM ne peut garantir une securite absolue. L’utilisateur doit utiliser un mot de passe solide, ne pas partager ses acces et signaler rapidement toute suspicion de compromission.',
        ],
      },
      {
        heading: '9. Cookies, sessions et stockage local',
        body: [
          'PULSEROOM peut utiliser des cookies ou mecanismes equivalents strictement necessaires a l’authentification, la securite, la navigation, la conservation de session et le fonctionnement du site.',
          'Si des cookies non strictement necessaires sont ajoutes ulterieurement, une information ou un mecanisme de choix adapte devra etre propose selon la reglementation applicable.',
        ],
      },
      {
        heading: '10. Donnees sensibles et precautions particulieres',
        body: [
          'PULSEROOM n’a pas vocation a collecter des donnees medicales, documents d’identite, adresses personnelles detaillees, coordonnees bancaires hors prestataire de paiement, contenus intimes prives ou informations sensibles non necessaires au service.',
          'Compte tenu de la nature adulte et connectee du service, les utilisateurs doivent limiter les informations partagees au strict necessaire, ne jamais communiquer d’informations personnelles dans les messages et respecter la vie privee des autres utilisateurs.',
        ],
      },
      {
        heading: '11. Violation de donnees',
        body: [
          'En cas de violation de donnees personnelles susceptible d’engendrer un risque pour les droits et libertes des personnes, PULSEROOM prendra les mesures raisonnables pour analyser l’incident, le limiter, le corriger et, lorsque la loi l’exige, informer les personnes concernees ou l’autorite competente.',
        ],
      },
    ],
  },
  {
    title: 'Mentions legales',
    blocks: [
      {
        heading: '1. Editeur du service',
        body: [
          'PULSEROOM est edite et exploite par le proprietaire de la plateforme. Les informations legales completes de l’editeur, notamment identite, adresse, forme juridique le cas echeant, responsable de publication et moyens de contact, doivent etre completees et tenues a jour par le proprietaire selon son pays d’exploitation.',
          'Contact support et donnees personnelles : contact@pulse-room.app.',
        ],
      },
      {
        heading: '2. Hebergement et fournisseurs techniques',
        body: [
          'Le site peut etre heberge par Vercel et utiliser des fournisseurs techniques tels que Turso, Stripe, Resend, Lovense, GitHub et tout autre prestataire necessaire au fonctionnement configure par le proprietaire.',
          'Les informations detaillees de ces prestataires doivent etre consultees dans leurs propres conditions, politiques de confidentialite et documents contractuels.',
        ],
      },
      {
        heading: '3. Signalement',
        body: [
          'Toute demande relative au service, a un compte, a un contenu, a un probleme technique, a la confidentialite ou a une suspicion d’abus doit etre adressee au support.',
        ],
      },
    ],
  },
  {
    title: 'Conditions de vente',
    blocks: [
      {
        heading: '1. Abonnements modeles',
        body: [
          'Lorsque des abonnements modeles sont proposes, ils sont factures selon le tarif, les avantages, la duree, les conditions d’essai et les modalites affiches lors de la souscription.',
          'Sauf mention contraire lors de l’achat, l’abonnement peut etre renouvele automatiquement et l’utilisateur peut demander sa resiliation selon les modalites indiquees dans son espace ou par le support.',
        ],
      },
      {
        heading: '2. Essai gratuit',
        body: [
          'Un essai gratuit peut etre propose temporairement. Il permet d’acceder aux fonctionnalites indiquees pendant la duree affichee. A l’issue de l’essai, certaines fonctions peuvent etre limitees ou necessiter un abonnement payant.',
        ],
      },
      {
        heading: '3. Achat de credits membres',
        body: [
          'Les membres peuvent acheter des credits additionnels lorsque cette option est proposee dans leur espace. Les credits achetes sont ajoutes au compte membre concerne apres confirmation du paiement par Stripe ou le prestataire de paiement configure.',
          'Les credits permettent d’utiliser les fonctionnalites de controle selon les regles du service, les limites du modele, la disponibilite de l’appareil et l’etat technique de la session.',
        ],
      },
      {
        heading: '4. Paiements, commissions et revenus',
        body: [
          'Les paiements peuvent etre traites par Stripe. PULSEROOM ne stocke pas directement les coordonnees completes de carte bancaire lorsque celles-ci sont saisies chez le prestataire de paiement.',
          'Lorsque Stripe Connect ou un systeme equivalent est utilise, le modele peut recevoir tout ou partie du montant selon la configuration, les commissions de plateforme, les frais Stripe, les taxes eventuelles et les regles applicables.',
        ],
      },
      {
        heading: '5. Remboursements et contestations',
        body: [
          'Sauf obligation legale contraire ou decision commerciale specifique, aucun remboursement n’est du pour une periode deja commencee, un credit deja consomme, un defaut lie a l’equipement personnel de l’utilisateur, une indisponibilite d’un service tiers ou une mauvaise utilisation du compte.',
          'Toute contestation de paiement, demande de remboursement ou anomalie doit etre signalee au support dans un delai raisonnable avec les informations permettant d’identifier la transaction.',
        ],
      },
      {
        heading: '6. Taxes et obligations declaratives',
        body: [
          'Chaque modele ou utilisateur percevant des revenus via PULSEROOM reste responsable de ses declarations fiscales, sociales, comptables et administratives selon sa situation et son pays.',
          'PULSEROOM ne fournit pas de conseil fiscal, social ou comptable.',
        ],
      },
    ],
  },
];

export const WEEKLY_LEGAL_UPDATES: WeeklyLegalUpdate[] = [
  {
    version: 'weekly-2026-07-05',
    title: 'Mises a jour de la semaine du 5 juillet 2026',
    summary:
      'Cette version informe les utilisateurs des dernieres evolutions PULSEROOM deployees cette semaine et met a jour les regles applicables.',
    changes: [
      'Ajout d’une messagerie directe entre les membres et leur modele.',
      'Ajout d’une recherche de membres par pseudo pour demarrer une conversation entre membres du meme espace modele.',
      'Ajout d’un rappel professionnel indiquant de ne jamais communiquer d’informations personnelles, bancaires ou privees dans les messages.',
      'Mise a jour complete des CGU, de la politique de confidentialite RGPD, des mentions legales, des paiements, des credits membres, des sous-traitants et des donnees traitees par PULSEROOM.',
      'Ajout d’un systeme d’acceptation obligatoire des nouveautes avant l’acces a l’espace lorsque les conditions evoluent.',
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
