import { WebSocketServer, type WebSocket } from 'ws';
import { db } from '@/lib/db';
import { resetWeeklyCreditsIfDue, tickAllActiveSessions } from '@/lib/session-engine';

/**
 * Serveur WebSocket dédié (processus séparé, lancé via `npm run ws`).
 * Next.js (App Router) ne permet pas de tenir un socket serveur persistant
 * dans les Route Handlers ; on isole donc le temps réel dans ce petit
 * serveur autonome, que l'app Next consomme comme un client.
 *
 * Rôle :
 *  - pousser les mises à jour de crédit / session vers le dashboard et /control/[token]
 *  - relayer les événements de la Toy Events API (batterie, connexion) reçus via callback
 */

const PORT = Number(process.env.WS_PORT ?? 4001);
const wss = new WebSocketServer({ port: PORT });

const subscriptions = new Map<string, Set<WebSocket>>(); // memberId -> sockets abonnés
const globalSubscribers = new Set<WebSocket>(); // dashboard : tout écouter

wss.on('connection', (socket, request) => {
  const url = new URL(request.url ?? '/', 'http://internal');
  const isInternalPublisher = url.pathname === '/internal-publish';
  const memberId = url.searchParams.get('memberId');

  if (isInternalPublisher) {
    socket.on('message', (message) => {
      try {
        const payload = JSON.parse(message.toString()) as { memberId?: string };
        publish(payload.memberId ?? null, payload);
      } catch (error) {
        console.error('[ws] Message interne invalide:', error);
      }
    });
  } else if (memberId) {
    if (!subscriptions.has(memberId)) subscriptions.set(memberId, new Set());
    subscriptions.get(memberId)!.add(socket);
  } else {
    globalSubscribers.add(socket);
  }

  socket.on('close', () => {
    if (memberId) subscriptions.get(memberId)?.delete(socket);
    globalSubscribers.delete(socket);
  });
});

export function publish(memberId: string | null, payload: unknown): void {
  const message = JSON.stringify(payload);

  if (memberId) {
    subscriptions.get(memberId)?.forEach((socket) => {
      if (socket.readyState === socket.OPEN) socket.send(message);
    });
  }

  globalSubscribers.forEach((socket) => {
    if (socket.readyState === socket.OPEN) socket.send(message);
  });
}

/**
 * Boucle serveur de synchronisation du chronomètre / crédit.
 * Toutes les secondes : décrémente le crédit des membres en contrôle actif,
 * arrête automatiquement la session si le crédit atteint zéro, et diffuse
 * l'état à jour. C'est la SEULE source de vérité pour le débit du crédit :
 * aucune autre partie du code ne doit décrémenter `remainingCredit`.
 */
setInterval(() => {
  tickAllActiveSessions(publish).catch((error) => {
    console.error('[ws] Erreur lors du tick des sessions actives:', error);
  });
}, 1000);

async function runWeeklyCreditReset(): Promise<void> {
  const resetCount = await resetWeeklyCreditsIfDue();

  if (resetCount > 0) {
    console.log(`[Vulse WS] Crédit hebdomadaire réinitialisé pour ${resetCount} membre(s).`);
    publish(null, { type: 'credit-reset', resetCount });
  }
}

runWeeklyCreditReset().catch((error) => {
  console.error('[ws] Erreur lors du reset hebdomadaire:', error);
});

setInterval(() => {
  runWeeklyCreditReset().catch((error) => {
    console.error('[ws] Erreur lors du reset hebdomadaire:', error);
  });
}, 60_000);

console.log(`[Vulse WS] Serveur temps réel démarré sur le port ${PORT}`);

// Restauration au démarrage : si le process a redémarré avec des sessions
// marquées "active" en base, elles reprennent leur décompte immédiatement
// (voir lib/session-engine.ts -> restoreActiveSessions).
import('@/lib/session-engine').then(({ restoreActiveSessions }) => {
  restoreActiveSessions().catch((error) => {
    console.error('[ws] Erreur lors de la restauration des sessions:', error);
  });
});

void db; // conserve la référence pour edge cases de bundling
