import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin, type CurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { groupUnreadAdminDirectMessages, hasAdminDirectMessagesTable } from '@/lib/admin-direct-messages';

const messageSchema = z.object({
  contactId: z.string().min(1),
  body: z.string().trim().min(1, 'Message vide.').max(1000, 'Message trop long.'),
});

const messageSelect = {
  id: true,
  senderAdminId: true,
  recipientAdminId: true,
  body: true,
  readByRecipientAt: true,
  createdAt: true,
};

async function findAllowedContact(admin: CurrentAdmin, contactId: string) {
  if (contactId === admin.id) return null;

  const contact = await db.adminUser.findUnique({
    where: { id: contactId },
    select: { id: true, role: true, active: true },
  });
  if (!contact?.active) return null;

  if (admin.role === 'OWNER') return contact;
  return contact.role === 'OWNER' ? contact : null;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  const contactId = request.nextUrl.searchParams.get('contactId');

  if (!contactId) {
    const unreadGroups = await groupUnreadAdminDirectMessages(admin.id);

    return NextResponse.json({
      unreadByContact: unreadGroups.map((item) => ({ contactId: item.senderAdminId, count: item._count._all })),
    });
  }

  const contact = await findAllowedContact(admin, contactId);
  if (!contact) {
    return NextResponse.json({ error: 'Contact introuvable.' }, { status: 404 });
  }

  if (!(await hasAdminDirectMessagesTable())) {
    return NextResponse.json({ messages: [] });
  }

  await db.adminDirectMessage.updateMany({
    where: { senderAdminId: contactId, recipientAdminId: admin.id, readByRecipientAt: null },
    data: { readByRecipientAt: new Date() },
  });

  const messages = await db.adminDirectMessage.findMany({
    where: {
      OR: [
        { senderAdminId: admin.id, recipientAdminId: contactId },
        { senderAdminId: contactId, recipientAdminId: admin.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 150,
    select: messageSelect,
  });

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const contact = await findAllowedContact(admin, parsed.data.contactId);
  if (!contact) {
    return NextResponse.json({ error: 'Contact introuvable.' }, { status: 404 });
  }

  if (!(await hasAdminDirectMessagesTable())) {
    return NextResponse.json({ error: 'La table des messages internes doit être créée sur Turso avant d’envoyer ce message.' }, { status: 503 });
  }

  const message = await db.adminDirectMessage.create({
    data: {
      senderAdminId: admin.id,
      recipientAdminId: contact.id,
      body: parsed.data.body,
    },
    select: messageSelect,
  });

  return NextResponse.json({ message }, { status: 201 });
}
