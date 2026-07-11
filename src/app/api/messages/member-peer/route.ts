import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { resolveMemberId } from '@/lib/member-access';

const messageSchema = z.object({
  secureToken: z.string().min(1),
  recipientMemberId: z.string().min(1),
  body: z.string().trim().min(1, 'Message vide.').max(1000, 'Message trop long.'),
});

const messageSelect = {
  id: true,
  senderMemberId: true,
  recipientMemberId: true,
  body: true,
  readByRecipientAt: true,
  createdAt: true,
};

async function resolvePeerAccess(secureToken: string, peerId: string) {
  const memberId = await resolveMemberId({ secureToken });
  if (memberId === peerId) throw new Error('Vous ne pouvez pas ouvrir une conversation avec vous-même.');

  const [member, peer] = await Promise.all([
    db.member.findUnique({ where: { id: memberId }, select: { id: true, ownerId: true, username: true } }),
    db.member.findUnique({ where: { id: peerId }, select: { id: true, ownerId: true, username: true, active: true } }),
  ]);

  if (!member?.ownerId || !peer?.active || peer.ownerId !== member.ownerId) {
    throw new Error('Membre introuvable.');
  }

  return { member, peer };
}

export async function GET(request: NextRequest) {
  const secureToken = request.nextUrl.searchParams.get('token') ?? '';
  const peerId = request.nextUrl.searchParams.get('peerId') ?? '';
  const markRead = request.nextUrl.searchParams.get('markRead') === '1';

  if (!secureToken || !peerId) return NextResponse.json({ error: 'Paramètres requis.' }, { status: 400 });

  try {
    const { member, peer } = await resolvePeerAccess(secureToken, peerId);

    if (markRead) {
      await db.memberDirectMessage.updateMany({
        where: { senderMemberId: peer.id, recipientMemberId: member.id, readByRecipientAt: null },
        data: { readByRecipientAt: new Date() },
      });
    }

    const messages = await db.memberDirectMessage.findMany({
      where: {
        OR: [
          { senderMemberId: member.id, recipientMemberId: peer.id },
          { senderMemberId: peer.id, recipientMemberId: member.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: messageSelect,
    });

    return NextResponse.json({ messages, peer: { id: peer.id, username: peer.username } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const { member, peer } = await resolvePeerAccess(parsed.data.secureToken, parsed.data.recipientMemberId);
    const message = await db.memberDirectMessage.create({
      data: {
        ownerId: member.ownerId,
        senderMemberId: member.id,
        recipientMemberId: peer.id,
        body: parsed.data.body,
      },
      select: messageSelect,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
