import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { resolveMemberId } from '@/lib/member-access';

const messageSchema = z.object({
  secureToken: z.string().min(1),
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
  const secureToken = request.nextUrl.searchParams.get('token') ?? '';
  const markRead = request.nextUrl.searchParams.get('markRead') === '1';
  if (!secureToken) return NextResponse.json({ error: 'Token requis.' }, { status: 400 });

  try {
    const memberId = await resolveMemberId({ secureToken });

    if (markRead) {
      await db.directMessage.updateMany({
        where: { memberId, sender: 'model', readByMemberAt: null },
        data: { readByMemberAt: new Date() },
      });
    }

    const messages = await db.directMessage.findMany({
      where: { memberId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: messageSelect,
    });

    return NextResponse.json({ messages });
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
    const memberId = await resolveMemberId({ secureToken: parsed.data.secureToken });
    const member = await db.member.findUniqueOrThrow({
      where: { id: memberId },
      select: { ownerId: true },
    });

    const message = await db.directMessage.create({
      data: {
        ownerId: member.ownerId,
        memberId,
        sender: 'member',
        body: parsed.data.body,
        readByMemberAt: new Date(),
      },
      select: messageSelect,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
