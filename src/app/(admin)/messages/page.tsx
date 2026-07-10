import { AdminMessagesPanel } from '@/components/messages/admin-messages-panel';
import { memberOwnerWhere, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const admin = await requireAdmin();
  const members = await db.member.findMany({
    where: memberOwnerWhere(admin),
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      username: true,
      platform: true,
      directMessages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { body: true, sender: true, createdAt: true },
      },
    },
  });
  const unreadGroups = await db.directMessage.groupBy({
    by: ['memberId'],
    where: { member: memberOwnerWhere(admin), sender: 'member', readByModelAt: null },
    _count: { _all: true },
  });
  const unreadByMember = new Map(unreadGroups.map((item) => [item.memberId, item._count._all]));
  const modelContacts =
    admin.role === 'OWNER'
      ? await db.adminUser.findMany({
          where: { id: { not: admin.id }, role: { in: ['MODEL', 'OWNER'] }, active: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, email: true, role: true },
        })
      : [];
  const supportContact =
    admin.role === 'MODEL'
      ? await db.adminUser.findFirst({
          where: { role: 'OWNER', active: true },
          orderBy: { createdAt: 'asc' },
          select: { id: true, email: true },
        })
      : null;
  const internalUnreadGroups = await db.adminDirectMessage.groupBy({
    by: ['senderAdminId'],
    where: { recipientAdminId: admin.id, readByRecipientAt: null },
    _count: { _all: true },
  });
  const unreadByContact = new Map(internalUnreadGroups.map((item) => [item.senderAdminId, item._count._all]));

  const conversations = members.map((member) => ({
    id: member.id,
    username: member.username,
    platform: member.platform,
    unreadCount: unreadByMember.get(member.id) ?? 0,
    lastMessage: member.directMessages[0]
      ? {
          ...member.directMessages[0],
          createdAt: member.directMessages[0].createdAt.toISOString(),
        }
      : null,
  }));
  const quickContacts =
    admin.role === 'OWNER'
      ? modelContacts.map((model) => ({
          id: model.id,
          label: model.name,
          detail: model.role === 'OWNER' ? `${model.email} · Admin` : model.email,
          kind: 'model' as const,
          unreadCount: unreadByContact.get(model.id) ?? 0,
        }))
      : supportContact
        ? [
          {
            id: supportContact.id,
            label: 'Support',
            detail: supportContact.email || 'contact@pulse-room.app',
            kind: 'support' as const,
            unreadCount: unreadByContact.get(supportContact.id) ?? 0,
          },
        ]
        : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-50">Messages</h1>
        <p className="mt-1 text-sm text-neutral-400">Discutez directement avec vos membres depuis une interface adaptée mobile et desktop.</p>
      </div>
      <AdminMessagesPanel currentAdminId={admin.id} initialConversations={conversations} quickContacts={quickContacts} />
    </div>
  );
}
