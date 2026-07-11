import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { resolveMemberId } from '@/lib/member-access';

export async function GET(request: NextRequest) {
  const secureToken = request.nextUrl.searchParams.get('token') ?? '';
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim();

  if (!secureToken) return NextResponse.json({ error: 'Token requis.' }, { status: 400 });
  if (query.length < 2) return NextResponse.json({ members: [] });

  try {
    const memberId = await resolveMemberId({ secureToken });
    const member = await db.member.findUniqueOrThrow({
      where: { id: memberId },
      select: { id: true, ownerId: true },
    });

    if (!member.ownerId) return NextResponse.json({ members: [] });

    const members = await db.member.findMany({
      where: {
        ownerId: member.ownerId,
        active: true,
        id: { not: member.id },
        username: { contains: query },
      },
      orderBy: { username: 'asc' },
      take: 8,
      select: { id: true, username: true, platform: true },
    });

    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
