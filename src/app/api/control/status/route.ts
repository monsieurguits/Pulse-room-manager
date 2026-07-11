import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { resetWeeklyCreditsIfDue, syncActiveSessions } from '@/lib/session-engine';
import { getEffectiveLovenseStatus } from '@/lib/lovense/service';
import { resolvePublicMemberId } from '@/lib/member-access';

export async function GET(request: NextRequest) {
  await resetWeeklyCreditsIfDue().catch(() => 0);
  await syncActiveSessions();

  const secureToken = request.nextUrl.searchParams.get('token');
  const controlClientId = request.nextUrl.searchParams.get('controlClientId');

  if (!secureToken) {
    return NextResponse.json({ error: 'Token requis.' }, { status: 400 });
  }

  const memberId = await resolvePublicMemberId({ secureToken });

  const member = await db.member.findUnique({
    where: { id: memberId },
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
  const deviceStatus = await getEffectiveLovenseStatus(member.id);

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
    connected: deviceStatus.connected,
    battery: deviceStatus.battery,
    toyName: deviceStatus.toyName,
    elapsedSeconds,
    estimatedEndAt: member.isControlling
      ? new Date(Date.now() + member.remainingCredit * 1000).toISOString()
      : null,
  });
}
