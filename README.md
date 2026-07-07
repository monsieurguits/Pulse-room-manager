# Vulse Control Manager

Application de gestion de membres et de contrôle temps réel d'appareils Lovense, construite avec Next.js 16 (App Router), React 19, TypeScript strict, Prisma/SQLite, TailwindCSS et un serveur WebSocket dédié.

## Démarrage rapide

```bash
npm install
cp .env.example .env        # puis renseignez vos vraies valeurs
npx prisma migrate dev --name init
npx prisma db seed
npm run dev                 # démarre Next.js sur http://localhost:3000
npm run ws                  # dans un second terminal : serveur temps réel (WebSocket)
```

L'administration est disponible sur `/dashboard`, la liste des membres sur `/members`, et la page de contrôle publique d'un membre sur `/control/[secureToken]` (le token est généré automatiquement à la création du membre).

## Pourquoi deux process (`npm run dev` + `npm run ws`) ?

Next.js App Router (Route Handlers / Server Actions) ne permet pas de maintenir un serveur WebSocket persistant dans le même process HTTP sans configuration serveur custom lourde. Ce projet isole donc le temps réel dans `src/lib/websocket/server.ts`, un petit serveur `ws` autonome qui :

- décrémente le crédit des membres en contrôle actif, une fois par seconde (source de vérité unique du débit de crédit) ;
- diffuse les mises à jour (crédit, statut de session, connexion/batterie du jouet) vers le dashboard et les pages `/control/[token]` ouvertes ;
- restaure proprement les sessions actives si le serveur redémarre (`restoreActiveSessions`).

Les Server Actions et Route Handlers Next.js se connectent à ce serveur en tant que client via `src/lib/websocket/publisher.ts` pour lui notifier les événements ponctuels (démarrage/arrêt de session, résultat de commande).

En production, lancez les deux process avec un gestionnaire de process (pm2, systemd, ou deux services séparés sur votre plateforme d'hébergement).

## Intégration Lovense

Toute communication avec l'API Lovense passe exclusivement par `src/lib/lovense/` :

- `client.ts` — appels HTTP bas niveau vers les endpoints officiels `https://api.lovense.com/api/lan/getQrCode` (génération QR / appairage) et `https://api.lovense.com/api/lan/v2/command` (Vibrate, Rotate, Pump, Thrusting, Function, Pattern, Preset, Stop), conformément à la documentation officielle [`lovense/Standard_solutions`](https://github.com/lovense/Standard_solutions).
- `service.ts` — service métier exposant `connect`, `disconnect`, `generateQRCode`, `pairDevice`, `getToys`, `getToyStatus`, `getBattery`, `vibrate`, `rotate`, `pump`, `thrust`, `functionCommand`, `pattern`, `preset`, `stop`, `stopAll`. **Aucun composant ni route n'appelle directement Lovense : tout transite par ce service.**

Le Developer Token est stocké côté serveur uniquement (table `Settings` ou `.env`), n'est jamais inclus dans le HTML/JS envoyé au navigateur, et le formulaire `/dashboard/settings` ne l'affiche jamais en clair après enregistrement.

Configurez dans le dashboard développeur Lovense (`https://www.lovense.com/user/developer/info`) :
- **Callback URL** : `https://votre-domaine/api/lovense/callback` (reçoit les mises à jour de connexion/batterie)
- **Heartbeat** : intervalle de mise à jour, réglable aussi depuis `/dashboard/settings`

## Architecture

```
prisma/schema.prisma        Schéma de données (Member, Session, Settings)
prisma/seed.ts               Jeu de données initial (Settings + membre de démo)
src/lib/db.ts                 Client Prisma singleton
src/lib/lovense/              Service Lovense (seul point d'accès à l'API Lovense)
src/lib/websocket/            Serveur + publisher temps réel
src/lib/session-engine.ts     Moteur de session/crédit (source unique de vérité du débit)
src/lib/dashboard-queries.ts  Agrégations pour le tableau de bord
src/server-actions/           Server Actions (CRUD Member, CRUD Settings)
src/app/api/                  Routes API REST demandées (control, lovense, members, settings)
src/app/(admin)/               Dashboard + gestion des membres (avec sidebar)
src/app/control/[secureToken]  Page publique de contrôle (sans sidebar admin)
src/components/               Composants réutilisables
src/hooks/                     Hooks (ex: useRealtimeMember — synchronisation WebSocket)
src/types/                     Types partagés (Lovense, dashboard, etc.)
```

## Règles de fonctionnement du crédit (garanties par le code)

1. Le crédit n'est décrémenté qu'à un seul endroit : `tickAllActiveSessions` dans `src/lib/session-engine.ts`, appelé une fois par seconde par le serveur WS.
2. Quand `remainingCredit` atteint 0, la session est automatiquement arrêtée, le jouet reçoit une commande `Stop`, et `isControlling` repasse à `false`.
3. Si le serveur redémarre, `restoreActiveSessions()` clôture proprement toute session restée "active" en base et coupe le jouet par sécurité — aucune session ne reste orpheline.
4. Le chronomètre affiché côté client est recalculé à partir de `startedAt` (timestamp serveur), jamais d'un simple compteur local : fermer l'onglet ne désynchronise rien.

## Tests

```bash
npm run test        # Vitest : règles de formatage et de débit de crédit
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
```

## Notes de déploiement

- Le token développeur Lovense doit être configuré avant tout appairage (`/dashboard/settings`).
- Le domaine renseigné dans `Settings.domain` est utilisé pour générer les liens de contrôle absolus copiés depuis l'administration.
- SQLite convient pour un déploiement mono-instance ; pour un déploiement multi-instance, remplacez le provider Prisma par PostgreSQL et adaptez `DATABASE_URL`.
