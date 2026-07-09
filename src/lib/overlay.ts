import crypto from 'node:crypto';
import { db } from '@/lib/db';

const OVERLAY_EVENT_LIMIT = 8;

export type OverlayEventType = 'control-started' | 'control-stopped';

export interface OverlayPowerStateInput {
  intensity?: number;
  pattern?: number[] | null;
  patternStepMs?: number | null;
}

export async function ensureOverlayToken(adminId: string): Promise<string> {
  const admin = await db.adminUser.findUnique({
    where: { id: adminId },
    select: { overlayToken: true },
  });

  if (admin?.overlayToken) return admin.overlayToken;

  const overlayToken = crypto.randomBytes(32).toString('hex');
  await db.adminUser.update({
    where: { id: adminId },
    data: { overlayToken },
  });

  return overlayToken;
}

export async function createControlOverlayEvent(memberId: string, type: OverlayEventType): Promise<void> {
  const member = await db.member.findUnique({
    where: { id: memberId },
    select: {
      id: true,
      ownerId: true,
      username: true,
      toyName: true,
      toyType: true,
    },
  });

  if (!member) return;

  const adminId = member.ownerId ?? (await resolveOwnerAdminId());
  if (!adminId) return;

  const toyName = member.toyName || member.toyType || 'Lovense';
  const message =
    type === 'control-started'
      ? `${member.username} a pris le contrôle du jouet ${toyName} depuis son espace FanClub.`
      : `${member.username} a terminé le contrôle du jouet ${toyName}.`;

  await db.$transaction([
    db.controlOverlayEvent.create({
      data: {
        adminId,
        memberId: member.id,
        type,
        message,
        username: member.username,
        toyName,
      },
    }),
    db.adminUser.update({
      where: { id: adminId },
      data:
        type === 'control-started'
          ? {
              overlayLiveActive: true,
              overlayLiveMemberId: member.id,
              overlayLiveUsername: member.username,
              overlayLiveToyName: toyName,
              overlayLiveIntensity: 0,
              overlayLivePatternJson: null,
              overlayLivePatternStepMs: null,
              overlayLiveUpdatedAt: new Date(),
            }
          : {
              overlayLiveActive: false,
              overlayLiveIntensity: 0,
              overlayLivePatternJson: null,
              overlayLivePatternStepMs: null,
              overlayLiveUpdatedAt: new Date(),
            },
    }),
  ]);
}

export async function getOverlayEvents(token: string, after: Date) {
  const admin = await db.adminUser.findUnique({
    where: { overlayToken: token },
    select: { id: true, active: true },
  });

  if (!admin?.active) return null;

  return db.controlOverlayEvent.findMany({
    where: {
      adminId: admin.id,
      createdAt: { gte: after },
    },
    orderBy: { createdAt: 'asc' },
    take: OVERLAY_EVENT_LIMIT,
    select: {
      id: true,
      type: true,
      message: true,
      username: true,
      toyName: true,
      createdAt: true,
    },
  });
}

export async function updateOverlayPowerState(memberId: string, input: OverlayPowerStateInput): Promise<void> {
  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { ownerId: true },
  });

  const adminId = member?.ownerId ?? (await resolveOwnerAdminId());
  if (!adminId) return;

  await db.adminUser.update({
    where: { id: adminId },
    data: {
      ...(typeof input.intensity === 'number'
        ? { overlayLiveIntensity: Math.min(20, Math.max(0, Math.round(input.intensity))) }
        : {}),
      ...(input.pattern !== undefined
        ? { overlayLivePatternJson: input.pattern ? JSON.stringify(input.pattern) : null }
        : {}),
      ...(input.patternStepMs !== undefined ? { overlayLivePatternStepMs: input.patternStepMs } : {}),
      overlayLiveUpdatedAt: new Date(),
    },
  });
}

export async function getOverlayLiveState(token: string) {
  const admin = await db.adminUser.findUnique({
    where: { overlayToken: token },
    select: {
      active: true,
      overlayLiveActive: true,
      overlayLiveMemberId: true,
      overlayLiveUsername: true,
      overlayLiveToyName: true,
      overlayLiveIntensity: true,
      overlayLivePatternJson: true,
      overlayLivePatternStepMs: true,
      overlayLiveUpdatedAt: true,
    },
  });

  if (!admin?.active) return null;

  return {
    active: admin.overlayLiveActive,
    memberId: admin.overlayLiveMemberId,
    username: admin.overlayLiveUsername,
    toyName: admin.overlayLiveToyName,
    intensity: admin.overlayLiveIntensity,
    pattern: parsePattern(admin.overlayLivePatternJson),
    patternStepMs: admin.overlayLivePatternStepMs,
    updatedAt: admin.overlayLiveUpdatedAt,
  };
}

function parsePattern(value: string | null): number[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((item) => Number(item)).filter((item) => Number.isFinite(item)).slice(0, 64)
      : null;
  } catch {
    return null;
  }
}

async function resolveOwnerAdminId(): Promise<string | null> {
  const owner = await db.adminUser.findFirst({
    where: { role: 'OWNER', active: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return owner?.id ?? null;
}
