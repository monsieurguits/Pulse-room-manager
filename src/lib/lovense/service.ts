import crypto from 'node:crypto';
import type { TipCommand } from '@prisma/client';
import { db } from '@/lib/db';
import { requestQrCode, sendCommand } from '@/lib/lovense/client';
import { updateOverlayPowerState } from '@/lib/overlay';
import { broadcast } from '@/lib/websocket/publisher';
import type { LovenseCallbackPayload, LovenseCommandResult, LovenseToy } from '@/types';

/**
 * Service Lovense — point d'entrée UNIQUE pour toute interaction avec les jouets.
 * Aucun composant ni route ne doit appeler l'API Lovense directement :
 * tout passe par les fonctions exportées ici.
 */

function utokenFor(memberId: string): string {
  const salt = process.env.LOVENSE_UTOKEN_SALT ?? 'vulse-salt';
  return crypto.createHash('md5').update(memberId + salt).digest('hex');
}

/** Génère le QR code d'appairage pour un membre donné. */
export async function generateQRCode(memberId: string) {
  const member = await db.member.findUniqueOrThrow({
  where: { id: memberId },
  select: {
    id: true,
    username: true,
    lovenseUserId: true,
    qrImageUrl: true,
    deviceDomain: true,
    httpsPort: true,
  },
});

  // Si un QR existe déjà et que le callback a déjà fourni le domaine, on le réutilise.
  // Sinon on régénère un QR pour forcer Lovense à utiliser la callback actuelle.
  if (member.qrImageUrl && member.deviceDomain && member.httpsPort) {
    return {
      result: true,
      data: {
        qr: member.qrImageUrl,
      },
    };
  }

  const response = await requestQrCode({
    uid: member.id,
    uname: member.username,
    utoken: utokenFor(member.id),
  });

  if (!response.result || !response.data?.qr) {
    throw new Error(
      response.message || "Impossible de générer le QR code d'appairage"
    );
  }

  await db.member.update({
    where: { id: memberId },
    data: {
      lovenseUserId: member.id,
      qrImageUrl: response.data.qr,
      deviceDomain: null,
      httpsPort: null,
      wsPort: null,
      connected: false,
    },
  });

  return response;
}

/** Alias sémantique demandé par le cahier des charges : pairDevice = generateQRCode + attente callback. */
export const pairDevice = generateQRCode;

/**
 * Traite le callback envoyé par l'app Lovense Connect/Remote après appairage
 * ou lors d'une mise à jour périodique (heartbeat). C'est ici que l'état
 * "connected / battery / toy info" est mis à jour en base, puis diffusé
 * en websocket vers le dashboard et la page /control/[token].
 */
export async function handleCallback(payload: LovenseCallbackPayload): Promise<void> {
  console.log("========== LOVENSE CALLBACK ==========");
  console.dir(payload, { depth: null });
  console.log("======================================");

  const member = await db.member.findFirst({
    where: {
      OR: [
        { lovenseUserId: payload.uid },
        { id: payload.uid },
      ],
    },
  });

  if (!member) {
    console.log("❌ Aucun membre trouvé pour uid :", payload.uid);
    return;
  }

  console.log("✅ Membre trouvé :", {
    id: member.id,
    username: member.username,
  });

  const toys = payload.toys ? Object.values(payload.toys) : [];
  const primaryToy = toys[0];
  const normalizedToys = toys.map((toy) => ({
    id: toy.id,
    name: toy.name,
    nickName: toy.nickName,
    status: Number(toy.status) === 1 ? 1 : 0,
    version: toy.version,
    battery: toy.battery,
  })) satisfies LovenseToy[];

  console.log("🎮 Jouet détecté :", primaryToy);

  console.log("🌍 Domaines reçus :", {
    domain: payload.domain,
    httpsPort: payload.httpsPort,
    wsPort: payload.wsPort,
    wssPort: payload.wssPort,
  });

  const updated = await db.member.update({
    where: { id: member.id },
    data: {
      deviceDomain: payload.domain ?? member.deviceDomain,
      httpsPort: toOptionalNumber(payload.httpsPort) ?? member.httpsPort,
      wsPort: toOptionalNumber(payload.wsPort ?? payload.wssPort) ?? member.wsPort,

      connected: normalizedToys.some((toy) => toy.status === 1),

      toyId: primaryToy?.id ?? member.toyId,
      toyName: primaryToy?.nickName || primaryToy?.name || member.toyName,
      toyType: primaryToy?.name ?? member.toyType,
      battery: primaryToy?.battery ?? member.battery,
      toysJson: normalizedToys.length > 0 ? JSON.stringify(normalizedToys) : member.toysJson,
    },
  });

  console.log("💾 Données enregistrées :", {
    deviceDomain: updated.deviceDomain,
    httpsPort: updated.httpsPort,
    wsPort: updated.wsPort,
    connected: updated.connected,
    toyId: updated.toyId,
    toyName: updated.toyName,
  });

  broadcast({
    type: "device-status",
    memberId: updated.id,
    connected: updated.connected,
    battery: updated.battery,
    toyName: updated.toyName,
    toys: normalizedToys,
  });
}

/** Marque le membre comme déconnecté (perte de liaison avec l'app Connect/Remote). */
export async function disconnect(memberId: string): Promise<void> {
  const updated = await db.member.update({
    where: { id: memberId },
    data: { connected: false },
  });
  broadcast({ type: 'device-status', memberId: updated.id, connected: false, battery: updated.battery });
}

/** Réutilise le lovenseUserId déjà stocké pour vérifier la connexion (ping via getToys). */
export async function connect(memberId: string): Promise<boolean> {
  const toys = await getToys(memberId);
  const anyConnected = toys.some((t) => t.status === 1);
  await db.member.update({ where: { id: memberId }, data: { connected: anyConnected } });
  return anyConnected;
}

/**
 * GetToys : interroge l'état des jouets d'un utilisateur.
 * Techniquement réalisé via une commande "Function" à durée nulle n'est pas
 * standard pour l'inventaire ; on s'appuie donc sur les données du dernier
 * callback stocké en base (mécanisme recommandé par la doc officielle),
 * complétées par un heartbeat déclenché côté app Lovense Connect.
 */
export async function getToys(memberId: string) {
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });
  const toys = parseStoredToys(member.toysJson);

  if (toys.length > 0) return toys;

  if (!member.toyId) return [];
  return [
    {
      id: member.toyId,
      name: member.toyName ?? member.toyType ?? 'Jouet',
      status: (member.connected ? 1 : 0) as 0 | 1,
      battery: member.battery ?? undefined,
    },
  ];
}

export async function getToyStatus(memberId: string) {
  const toys = await getToys(memberId);
  return toys[0] ?? null;
}

export async function getBattery(memberId: string): Promise<number | null> {
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });
  return member.battery ?? null;
}

async function requireLovenseTarget(memberId: string, toyId?: string) {
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });
  if (!member.lovenseUserId) {
    throw new Error("Ce membre n'est pas encore appairé à un jouet Lovense.");
  }
  if (!member.deviceDomain || !member.httpsPort) {
    throw new Error("Le callback Lovense n'a pas encore fourni le domaine de connexion du jouet.");
  }
  if (toyId) {
    const toys = parseStoredToys(member.toysJson);
    const isKnownToy = toys.length === 0 || toys.some((toy) => toy.id === toyId);
    if (!isKnownToy) {
      throw new Error("Ce jouet n'est pas disponible pour ce membre.");
    }
  }
  return {
    sourceMemberId: member.id,
    ownerId: member.ownerId,
    uid: member.lovenseUserId,
    domain: member.deviceDomain,
    httpsPort: member.httpsPort,
    toy: toyId,
  };
}

type LovenseTarget = Awaited<ReturnType<typeof requireLovenseTarget>>;

async function runCommand(
  memberId: string,
  build: (target: LovenseTarget) => Parameters<typeof sendCommand>[0],
  toyId?: string
): Promise<LovenseCommandResult> {
  const target = await requireLovenseTarget(memberId, toyId);
  let result = await sendCommand(build(target));

  if (!result.ok && isLovenseAppOffline(result)) {
    await db.member.update({ where: { id: target.sourceMemberId }, data: { connected: false } }).catch(() => undefined);

    const fallbackTarget = await findFallbackLovenseTarget(target, toyId);
    if (fallbackTarget) {
      result = await sendCommand(build(fallbackTarget));
    }
  }

  broadcast({ type: 'command-result', memberId, ok: result.ok, message: result.message });
  return result;
}

function isLovenseAppOffline(result: LovenseCommandResult): boolean {
  const message = `${result.message} ${JSON.stringify(result.raw ?? {})}`.toLowerCase();
  return message.includes('app is offline') || message.includes('offline');
}

async function findFallbackLovenseTarget(currentTarget: LovenseTarget, toyId?: string): Promise<LovenseTarget | null> {
  const candidates = await db.member.findMany({
    where: {
      ownerId: currentTarget.ownerId,
      connected: true,
      lovenseUserId: { not: null },
      deviceDomain: { not: null },
      httpsPort: { not: null },
      NOT: { lovenseUserId: currentTarget.uid },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  const candidate = candidates.find((member) => {
    if (!toyId) return true;
    const toys = parseStoredToys(member.toysJson);
    return toys.length === 0 || toys.some((toy) => toy.id === toyId);
  });

  if (!candidate?.lovenseUserId || !candidate.deviceDomain || !candidate.httpsPort) {
    return null;
  }

  console.log('Lovense fallback UID utilisé:', {
    fromUid: currentTarget.uid,
    toUid: candidate.lovenseUserId,
    memberId: candidate.id,
    toyId,
  });

  return {
    sourceMemberId: candidate.id,
    ownerId: candidate.ownerId,
    uid: candidate.lovenseUserId,
    domain: candidate.deviceDomain,
    httpsPort: candidate.httpsPort,
    toy: toyId,
  };
}

export async function vibrate(memberId: string, level: number, timeSec = 0, toyId?: string) {
  const result = await runCommand(memberId, (target) => ({
    ...target,
    command: 'Function',
    action: `Vibrate:${clamp(level)}`,
    timeSec,
  }), toyId);
  if (result.ok) await updateOverlayPowerState(memberId, { intensity: level, pattern: null, patternStepMs: null }).catch(() => undefined);
  return result;
}

export interface TipCommandInput {
  memberId: string;
  type?: 'vibrate' | 'pattern' | 'preset' | 'function';
  level?: number;
  timeSec?: number;
  action?: string;
  rule?: string;
  strength?: string;
  preset?: 'pulse' | 'wave' | 'fireworks' | 'earthquake';
  source?: string;
  amount?: number;
  message?: string;
}

export async function enqueueTipCommand(input: TipCommandInput) {
  const tip = await db.tipCommand.create({
    data: {
      memberId: input.memberId,
      type: input.type ?? 'vibrate',
      level: typeof input.level === 'number' ? clamp(input.level) : 10,
      timeSec: input.timeSec ?? 5,
      action: input.action,
      rule: input.rule,
      strength: input.strength,
      preset: input.preset,
      source: input.source,
      amount: input.amount,
      message: input.message,
    },
  });

  const hasActiveMemberControl = await hasActiveControlForTipMember(tip.memberId);

  if (hasActiveMemberControl) {
    broadcast({
      type: 'tip-queued',
      memberId: tip.memberId,
      tipId: tip.id,
      source: tip.source,
      amount: tip.amount,
    });
    return { status: 'queued' as const, tip };
  }

  await processPendingTipCommands();
  return { status: 'started' as const, tip };
}

export async function processPendingTipCommands(): Promise<void> {
  const hasRunningTip = await db.tipCommand.findFirst({
    where: { status: 'running' },
    select: { id: true },
  });

  if (hasRunningTip) return;

  const tip = await db.tipCommand.findFirst({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
  });

  if (!tip) return;

  const hasActiveMemberControl = await hasActiveControlForTipMember(tip.memberId);
  if (hasActiveMemberControl) return;

  await db.tipCommand.update({
    where: { id: tip.id },
    data: { status: 'running', startedAt: new Date(), error: null },
  });

  broadcast({
    type: 'tip-started',
    memberId: tip.memberId,
    tipId: tip.id,
    source: tip.source,
    amount: tip.amount,
  });

  try {
    const result = await executeTipCommand(tip);

    if (!result.ok) {
      throw new Error(result.message ?? "La commande tip n'a pas été acceptée par Lovense.");
    }

    await windowlessDelay(Math.max(1, tip.timeSec) * 1000);
    await stop(tip.memberId).catch(() => undefined);

    await db.tipCommand.update({
      where: { id: tip.id },
      data: { status: 'completed', completedAt: new Date() },
    });

    broadcast({
      type: 'tip-completed',
      memberId: tip.memberId,
      tipId: tip.id,
      source: tip.source,
      amount: tip.amount,
    });
  } catch (error) {
    await db.tipCommand.update({
      where: { id: tip.id },
      data: { status: 'failed', completedAt: new Date(), error: (error as Error).message },
    });

    broadcast({
      type: 'tip-failed',
      memberId: tip.memberId,
      tipId: tip.id,
      error: (error as Error).message,
    });
  } finally {
    await processPendingTipCommands().catch(() => undefined);
  }
}

async function hasActiveControlForTipMember(memberId: string): Promise<boolean> {
  const tipMember = await db.member.findUnique({
    where: { id: memberId },
    select: { ownerId: true },
  });

  const activeSession = await db.session.findFirst({
    where: {
      active: true,
      member: tipMember?.ownerId ? { ownerId: tipMember.ownerId } : undefined,
    },
    select: { id: true },
  });

  return Boolean(activeSession);
}

async function executeTipCommand(tip: TipCommand): Promise<LovenseCommandResult> {
  switch (tip.type) {
    case 'pattern':
      if (!tip.rule || !tip.strength) throw new Error('Tip pattern incomplet.');
      return pattern(tip.memberId, tip.rule, tip.strength, tip.timeSec);
    case 'preset':
      if (!tip.preset) throw new Error('Tip preset incomplet.');
      return preset(tip.memberId, tip.preset, tip.timeSec);
    case 'function':
      if (!tip.action) throw new Error('Tip action incomplet.');
      return functionCommand(tip.memberId, tip.action, tip.timeSec);
    case 'vibrate':
    default:
      return vibrate(tip.memberId, tip.level ?? 10, tip.timeSec);
  }
}

function windowlessDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function rotate(memberId: string, level: number, timeSec = 0, toyId?: string) {
  const result = await runCommand(memberId, (target) => ({
    ...target,
    command: 'Function',
    action: `Rotate:${clamp(level)}`,
    timeSec,
  }), toyId);
  if (result.ok) await updateOverlayPowerState(memberId, { intensity: level, pattern: null, patternStepMs: null }).catch(() => undefined);
  return result;
}

export async function pump(memberId: string, level: number, timeSec = 0, toyId?: string) {
  const result = await runCommand(memberId, (target) => ({
    ...target,
    command: 'Function',
    action: `Pump:${clamp(level)}`,
    timeSec,
  }), toyId);
  if (result.ok) await updateOverlayPowerState(memberId, { intensity: level, pattern: null, patternStepMs: null }).catch(() => undefined);
  return result;
}

export async function thrust(memberId: string, level: number, timeSec = 0, toyId?: string) {
  const result = await runCommand(memberId, (target) => ({
    ...target,
    command: 'Function',
    action: `Thrusting:${clamp(level)}`,
    timeSec,
  }), toyId);
  if (result.ok) await updateOverlayPowerState(memberId, { intensity: level, pattern: null, patternStepMs: null }).catch(() => undefined);
  return result;
}

/** Envoie une action brute au format "Vibrate:10", "Rotate:15", etc. */
export async function functionCommand(memberId: string, action: string, timeSec = 0, toyId?: string) {
  const result = await runCommand(memberId, (target) => ({ ...target, command: 'Function', action, timeSec }), toyId);
  if (result.ok) {
    await updateOverlayPowerState(memberId, {
      intensity: action.toLowerCase() === 'stop' ? 0 : parseActionIntensity(action),
      pattern: null,
      patternStepMs: null,
    }).catch(() => undefined);
  }
  return result;
}

/** Pattern personnalisé : séquence de positions/intensités séparées par ';'. */
export async function pattern(memberId: string, rule: string, strength: string, timeSec = 0, toyId?: string) {
  const result = await runCommand(memberId, (target) => ({ ...target, command: 'Pattern', rule, strength, timeSec }), toyId);
  if (result.ok) {
    const strengths = parseStrengths(strength);
    await updateOverlayPowerState(memberId, {
      intensity: strengths[0] ?? 0,
      pattern: strengths,
      patternStepMs: parsePatternStepMs(rule),
    }).catch(() => undefined);
  }
  return result;
}

/** Preset prédéfini côté Lovense : "pulse", "wave", "fireworks", "earthquake"... */
export async function preset(memberId: string, name: string, timeSec = 0, toyId?: string) {
  const result = await runCommand(memberId, (target) => ({ ...target, command: 'Preset', name, timeSec }), toyId);
  if (result.ok) {
    const strengths = presetStrengths(name);
    await updateOverlayPowerState(memberId, {
      intensity: strengths[0] ?? 0,
      pattern: strengths,
      patternStepMs: 420,
    }).catch(() => undefined);
  }
  return result;
}

/** Stoppe le jouet du membre ciblé. */
export async function stop(memberId: string, toyId?: string) {
  const result = await runCommand(memberId, (target) => ({ ...target, command: 'Function', action: 'Stop', timeSec: 0 }), toyId);
  if (result.ok) await updateOverlayPowerState(memberId, { intensity: 0, pattern: null, patternStepMs: null }).catch(() => undefined);
  return result;
}

/** Stoppe tous les jouets actuellement en contrôle (utilisé en cas d'urgence / crédit épuisé). */
export async function stopAll(): Promise<void> {
  const activeMembers = await db.member.findMany({ where: { isControlling: true } });
  await Promise.all(
    activeMembers.map(async (member) => {
      if (member.lovenseUserId) {
        if (member.deviceDomain && member.httpsPort) {
          await sendCommand({
            uid: member.lovenseUserId,
            domain: member.deviceDomain,
            httpsPort: member.httpsPort,
            command: 'Function',
            action: 'Stop',
            timeSec: 0,
          });
          await updateOverlayPowerState(member.id, { intensity: 0, pattern: null, patternStepMs: null }).catch(() => undefined);
        }
      }
    })
  );
}

function clamp(level: number): number {
  return Math.max(0, Math.min(20, Math.round(level)));
}

function parseActionIntensity(action: string): number {
  const match = action.match(/:(\d+)/);
  return match ? clamp(Number(match[1])) : 0;
}

function parseStrengths(strength: string): number[] {
  return strength
    .split(';')
    .map((value) => clamp(Number(value.trim())))
    .filter((value) => Number.isFinite(value));
}

function parsePatternStepMs(rule: string): number {
  const match = rule.match(/S:(\d+)/i);
  return match ? Math.max(120, Math.min(2000, Number(match[1]))) : 420;
}

function presetStrengths(name: string): number[] {
  switch (name) {
    case 'pulse':
      return [4, 20, 4, 20, 4, 20];
    case 'wave':
      return [2, 5, 9, 14, 18, 20, 18, 14, 9, 5];
    case 'fireworks':
      return [0, 4, 12, 20, 6, 16, 20, 3, 18, 0];
    case 'earthquake':
      return [18, 20, 15, 20, 17, 19];
    default:
      return [10];
  }
}

function toOptionalNumber(value: string | number | undefined): number | undefined {
  if (typeof value === 'number') return value;
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseStoredToys(value: string | null): LovenseToy[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as LovenseToy[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((toy) => toy && typeof toy.id === 'string')
      .map((toy) => ({
        id: toy.id,
        name: toy.name || toy.nickName || 'Jouet',
        nickName: toy.nickName,
        status: Number(toy.status) === 1 ? 1 : 0,
        version: toy.version,
        battery: toy.battery,
      }));
  } catch {
    return [];
  }
}
