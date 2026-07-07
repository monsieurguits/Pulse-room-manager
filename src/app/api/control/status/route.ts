import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { syncActiveSessions } from '@/lib/session-engine';

export async function GET(request: NextRequest) {
  await syncActiveSessions();

  const memberId = request.nextUrl.searchParams.get('memberId');
  const secureToken = request.nextUrl.searchParams.get('token');
  const controlClientId = request.nextUrl.searchParams.get('controlClientId');

  if (!memberId && !secureToken) {
    return NextResponse.json({ error: 'memberId ou token requis.' }, { status: 400 });
  }

  const member = await db.member.findUnique({
    where: memberId ? { id: memberId } : { secureToken: secureToken! },
    include: {
      sessions: { where: { active: true }, orderBy: { startedAt: 'desc' }, take: 1 },
    },
  });

  if (!member) {
    return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
  }

  let activeSession = await db.session.findFirst({
    where: { active: true },
    orderBy: { startedAt: 'desc' },
  });

  if (
    activeSession &&
    activeSession.memberId === member.id &&
    controlClientId &&
    activeSession.controlClientId !== controlClientId
  ) {
    activeSession = await db.session.update({
      where: { id: activeSession.id },
      data: { controlClientId },
    });
  }

  const canControl = Boolean(
    activeSession &&
      activeSession.memberId === member.id &&
      controlClientId &&
      activeSession.controlClientId === controlClientId
  );
  const isWaiting = Boolean(activeSession && !canControl);
  const elapsedSeconds = activeSession
    ? Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000)
    : 0;

  return NextResponse.json({
    memberId: member.id,
    username: member.username,
    platform: member.platform,
    active: member.active,
    isControlling: Boolean(activeSession),
    canControl,
    isWaiting,
    remainingCredit: member.remainingCredit,
    weeklyCredit: member.weeklyCredit,
    connected: member.connected,
    battery: member.battery,
    toyName: member.toyName,
    elapsedSeconds,
    estimatedEndAt: member.isControlling
      ? new Date(Date.now() + member.remainingCredit * 1000).toISOString()
      : null,
  });
}
