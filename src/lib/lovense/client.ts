import { db } from '@/lib/db';
import type { LovenseCommandResult, LovensePairResponse, ToyAction } from '@/types';

/**
 * Client HTTP bas niveau pour l'API Standard de Lovense.
 * Documentation officielle : https://github.com/lovense/Standard_solutions
 *
 * Endpoints officiels :
 *  - Génération QR / association :  POST https://api.lovense.com/api/lan/getQrCode
 *  - Envoi de commandes          :  POST https://{domain}:{httpsPort}/command
 *
 * Le Developer Token n'est JAMAIS exposé au client : ce fichier est marqué
 * "server-only" et n'est importé que par des Server Actions / Route Handlers.
 */

const LOVENSE_QR_ENDPOINT = 'https://api.lovense.com/api/lan/getQrCode';
const LOVENSE_CLOUD_COMMAND_ENDPOINT = 'https://api.lovense.com/api/lan/v2/command';

let cachedToken: { value: string; expiresAt: number } | null = null;

/** Récupère le Developer Token depuis la table Settings (source de vérité), avec repli sur .env. */
export async function getDeveloperToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const settings = await db.settings.findUnique({ where: { id: 'settings' } });
  const token = settings?.developerToken ?? process.env.LOVENSE_DEVELOPER_TOKEN;

  if (!token) {
    throw new Error(
      'Developer Token Lovense manquant. Configurez-le dans /dashboard/settings ou dans LOVENSE_DEVELOPER_TOKEN.'
    );
  }

  // Cache court (60s) pour éviter une lecture DB à chaque commande, sans jamais figer une valeur obsolète.
  cachedToken = { value: token, expiresAt: now + 60_000 };
  return token;
}

export async function getCallbackUrl(): Promise<string> {
  const settings = await db.settings.findUnique({ where: { id: 'settings' } });
  const url = settings?.callbackUrl ?? process.env.LOVENSE_CALLBACK_URL;
  if (!url) {
    throw new Error('Callback URL Lovense manquante. Configurez-la dans /dashboard/settings.');
  }
  return normalizeCallbackUrl(url);
}

function normalizeCallbackUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  try {
    const url = new URL(trimmed);
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/api/lovense/callback';
    }
    return url.toString();
  } catch {
    return trimmed;
  }
}

interface QrCodePayload {
  uid: string;
  uname: string;
  utoken: string;
}

/**
 * POST /api/lan/getQrCode
 * Génère un QR code d'appairage. L'utilisateur scanne ce QR avec l'app
 * Lovense Connect/Remote, qui déclenche ensuite le Callback URL configuré
 * dans le dashboard développeur avec l'état du/des jouet(s).
 */
export async function requestQrCode(payload: QrCodePayload): Promise<LovensePairResponse> {
  const token = await getDeveloperToken();
  const callbackUrl = await getCallbackUrl();
  console.log('Lovense callback URL utilisée:', callbackUrl);

  const res = await fetch(LOVENSE_QR_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      uid: payload.uid,
      uname: payload.uname,
      utoken: payload.utoken,
      callbackUrl,
      callback_url: callbackUrl,
      v: 2,
    }),
    cache: "no-store",
  });

  const json = await res.json();

  console.log("Lovense getQrCode:", json);

  if (!res.ok) {
    throw new Error(`Lovense HTTP ${res.status}`);
  }

  if (json.result === false) {
    throw new Error(json.message ?? "Erreur Lovense");
  }

  return json as LovensePairResponse;
}

export interface SendCommandOptions {
  domain: string;
  httpsPort: number;
  uid: string;
  command: ToyAction;
  toy?: string; // id du jouet ciblé, omis = tous les jouets de l'utilisateur
  action?: string; // ex: "Vibrate:10" pour Function
  timeSec?: number; // 0 = illimité (jusqu'au prochain Stop)
  loopRunningSec?: number;
  loopPauseSec?: number;
  name?: string; // pour Preset (ex: "pulse", "wave")
  rule?: string; // pour Pattern (ex: "V:1;F:v;S:1000#")
  strength?: string; // pour Pattern - intensités séparées par ';'
}

/**
 * POST /api/lan/v2/command
 * Point d'entrée unique pour toute commande envoyée à un jouet appairé :
 * Vibrate, Rotate, Pump, Thrusting, Function, Pattern, Preset, Stop.
 */
export async function sendCommand(options: SendCommandOptions): Promise<LovenseCommandResult> {
  const token = await getDeveloperToken();

  const body: Record<string, unknown> = {
    token,
    uid: options.uid,
    command: options.command,
    apiVer: 1,
  };

  if (options.toy) body.toy = options.toy;
  if (options.action) body.action = options.action;
  if (typeof options.timeSec === 'number') body.timeSec = options.timeSec;
  if (typeof options.loopRunningSec === 'number') body.loopRunningSec = options.loopRunningSec;
  if (typeof options.loopPauseSec === 'number') body.loopPauseSec = options.loopPauseSec;
  if (options.name) body.name = options.name;
  if (options.rule) body.rule = options.rule;
  if (options.strength) body.strength = options.strength;

  const directEndpoint = `https://${options.domain}:${options.httpsPort}/command`;
  return sendToFastestLovenseEndpoint([
    { endpoint: directEndpoint, timeoutMs: 1200 },
    { endpoint: LOVENSE_CLOUD_COMMAND_ENDPOINT, timeoutMs: 3500 },
  ], body);
}

async function sendToFastestLovenseEndpoint(
  endpoints: Array<{ endpoint: string; timeoutMs: number }>,
  body: Record<string, unknown>,
): Promise<LovenseCommandResult> {
  const controllers = endpoints.map(() => new AbortController());
  const errors: unknown[] = [];

  const requests = endpoints.map(({ endpoint, timeoutMs }, index) =>
    postCommand(endpoint, body, timeoutMs, controllers[index]!.signal)
      .then((response) => normalizeCommandResponse(response))
      .then((result) => {
        if (!result.ok) throw result;
        controllers.forEach((controller, controllerIndex) => {
          if (controllerIndex !== index) controller.abort();
        });
        return result;
      })
      .catch((error) => {
        if ((error as Error)?.name !== 'AbortError') errors.push(error);
        throw error;
      }),
  );

  try {
    return await Promise.any(requests);
  } catch {
    const usefulError = errors.find((error) => typeof error === 'object' && error && 'message' in error) as { message?: string } | undefined;
    throw new Error(`Impossible de joindre Lovense depuis le serveur (${usefulError?.message || 'fetch failed'}).`);
  }
}

async function normalizeCommandResponse(res: Response): Promise<LovenseCommandResult> {
  if (!res.ok) {
    return { ok: false, code: res.status, message: `Erreur HTTP ${res.status}` };
  }

  const json = (await res.json()) as { code: number; message?: string; result?: boolean; type?: string };
  return {
    ok: json.code === 200 || json.result === true || json.type?.toLowerCase() === 'ok',
    code: json.code,
    message: json.message ?? json.type ?? 'Commande envoyée.',
    raw: json,
  };
}

function postCommand(endpoint: string, body: Record<string, unknown>, timeoutMs: number, signal?: AbortSignal) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: combinedSignal,
  });
}
