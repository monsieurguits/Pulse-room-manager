import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { canAccessMember, memberOwnerWhere, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

const messageSchema = z.object({
  memberId: z.string().min(1),
  body: z.string().trim().min(1, 'Message vide.').max(1000, 'Message trop long.'),
});

const messageSelect = {
  id: true,
  sender: true,
  body: true,
  createdAt: true,
  readByModelAt: true,
  readByMemberAt: true,
};

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  const memberId = request.nextUrl.searchParams.get('memberId');

  if (memberId) {
    const member = await db.member.findUnique({ where: { id: memberId }, select: { ownerId: true } });
    if (!member || !canAccessMember(admin, member)) {
      return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
    }

    await db.directMessage.updateMany({
      where: { memberId, sender: 'member', readByModelAt: null },
      data: { readByModelAt: new Date() },
    });

    const messages = await db.directMessage.findMany({
      where: { memberId },
      orderBy: { createdAt: 'asc' },
      take: 150,
      select: messageSelect,
    });

    return NextResponse.json({ messages });
  }

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

  const conversations = members
    .map((member) => ({
      id: member.id,
      username: member.username,
      platform: member.platform,
      unreadCount: unreadByMember.get(member.id) ?? 0,
      lastMessage: member.directMessages[0] ?? null,
    }))
    .sort((a, b) => {
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const member = await db.member.findUnique({
    where: { id: parsed.data.memberId },
    select: { ownerId: true },
  });
  if (!member || !canAccessMember(admin, member)) {
    return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
  }

  const message = await db.directMessage.create({
    data: {
      ownerId: member.ownerId ?? admin.id,
      memberId: parsed.data.memberId,
      sender: 'model',
      body: parsed.data.body,
      readByModelAt: new Date(),
    },
    select: messageSelect,
  });

  return NextResponse.json({ message }, { status: 201 });
}
