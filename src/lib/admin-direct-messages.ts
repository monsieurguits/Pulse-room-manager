import { db } from '@/lib/db';

let tableExistsCache: { value: boolean; expiresAt: number } | null = null;

export async function hasAdminDirectMessagesTable(): Promise<boolean> {
  const now = Date.now();
  if (tableExistsCache && tableExistsCache.expiresAt > now) return tableExistsCache.value;

  try {
    const rows = await db.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'AdminDirectMessage'
    `;
    const value = rows.length > 0;
    tableExistsCache = { value, expiresAt: now + 30_000 };
    return value;
  } catch {
    tableExistsCache = { value: false, expiresAt: now + 30_000 };
    return false;
  }
}

export async function countUnreadAdminDirectMessages(adminId: string): Promise<number> {
  if (!(await hasAdminDirectMessagesTable())) return 0;

  return db.adminDirectMessage.count({
    where: { recipientAdminId: adminId, readByRecipientAt: null },
  });
}

export async function groupUnreadAdminDirectMessages(adminId: string) {
  if (!(await hasAdminDirectMessagesTable())) return [];

  return db.adminDirectMessage.groupBy({
    by: ['senderAdminId'],
    where: { recipientAdminId: adminId, readByRecipientAt: null },
    _count: { _all: true },
  });
}
