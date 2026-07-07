import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { stopSession } from '@/lib/session-engine';
import { canAccessMember, requireAdmin } from '@/lib/auth';

const updateSchema = z.object({
  username: z.string().min(2).optional(),
  platform: z.string().min(1).optional(),
  memberSince: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  weeklyCredit: z.coerce.number().int().min(0).optional(),
  active: z.coerce.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  const { id } = await params;
  const member = await db.member.findUnique({
    where: { id },
    include: { sessions: { orderBy: { startedAt: 'desc' }, take: 50 } },
  });

  if (!member || !canAccessMember(admin, member)) {
    return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
  }
  return NextResponse.json({ member });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await db.member.findUnique({ where: { id }, select: { ownerId: true } });
  if (!existing || !canAccessMember(admin, existing)) {
    return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
  }

  const member = await db.member.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ member });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  const { id } = await params;
  const member = await db.member.findUnique({ where: { id }, select: { ownerId: true } });
  if (!member || !canAccessMember(admin, member)) {
    return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
  }

  await stopSession(id, 'manual').catch(() => undefined);
  await db.member.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
