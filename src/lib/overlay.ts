import crypto from 'node:crypto';
import { db } from '@/lib/db';

const OVERLAY_EVENT_LIMIT = 8;

export type OverlayEventType = 'control-started' | 'control-stopped';

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
      ? `${member.username} a pris le contrôle du jouet ${toyName}`
      : `${member.username} a terminé le contrôle du jouet ${toyName}`;

  await db.controlOverlayEvent.create({
    data: {
      adminId,
      memberId: member.id,
      type,
      message,
      username: member.username,
      toyName,
    },
  });
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

async function resolveOwnerAdminId(): Promise<string | null> {
  const owner = await db.adminUser.findFirst({
    where: { role: 'OWNER', active: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return owner?.id ?? null;
}
