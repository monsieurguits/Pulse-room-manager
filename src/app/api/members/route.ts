import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const createSchema = z.object({
  username: z.string().min(2),
  platform: z.string().min(1),
  memberSince: z.coerce.date().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  weeklyCredit: z.coerce.number().int().min(0),
});

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const pageSize = Number(request.nextUrl.searchParams.get('pageSize') ?? '20');
  const sortBy = (request.nextUrl.searchParams.get('sortBy') ?? 'createdAt') as
    | 'createdAt'
    | 'username'
    | 'remainingCredit'
    | 'endDate';
  const sortDir = (request.nextUrl.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

  const where = search
    ? { username: { contains: search } }
    : {};

  const [members, total] = await Promise.all([
    db.member.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.member.count({ where }),
  ]);

  return NextResponse.json({ members, total, page, pageSize });
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const member = await db.member.create({
    data: {
      ...parsed.data,
      remainingCredit: parsed.data.weeklyCredit,
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
