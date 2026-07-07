import WebSocket from 'ws';

/**
 * Le process Next.js (App Router) et le process WebSocket (src/lib/websocket/server.ts)
 * sont deux processus séparés. Pour que les Server Actions / Route Handlers Next.js
 * puissent pousser un événement temps réel, on maintient une connexion WebSocket
 * client persistante vers le serveur WS interne (localhost).
 */

const WS_INTERNAL_URL = `ws://127.0.0.1:${process.env.WS_PORT ?? 4001}/internal-publish`;

let internalSocket: WebSocket | null = null;
let connecting: Promise<WebSocket> | null = null;

async function getSocket(): Promise<WebSocket> {
  if (internalSocket && internalSocket.readyState === WebSocket.OPEN) {
    return internalSocket;
  }
  if (connecting) return connecting;

  connecting = new Promise((resolve, reject) => {
    const socket = new WebSocket(WS_INTERNAL_URL);
    socket.once('open', () => {
      internalSocket = socket;
      connecting = null;
      resolve(socket);
    });
    socket.once('error', (err) => {
      connecting = null;
      reject(err);
    });
  });

  return connecting;
}

export interface RealtimeEvent {
  type:
    | 'credit-tick'
    | 'session-started'
    | 'session-stopped'
    | 'device-status'
    | 'command-result'
    | 'tip-queued'
    | 'tip-started'
    | 'tip-completed'
    | 'tip-failed';
  memberId: string;
  [key: string]: unknown;
}

/** Diffuse un événement temps réel. N'échoue jamais l'appel Server Action si le WS est indisponible. */
export function broadcast(event: RealtimeEvent): void {
  getSocket()
    .then((socket) => socket.send(JSON.stringify(event)))
    .catch(() => {
      // Le serveur WS est optionnel pour le fonctionnement fonctionnel de base
      // (la BDD reste la source de vérité) : on ne bloque jamais l'action.
    });
}
