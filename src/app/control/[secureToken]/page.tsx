import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ControlPanel } from '@/components/control-panel';
import { TermsAcceptancePanel } from '@/components/terms-acceptance-panel';
import { getEffectiveLovenseStatus, getToys } from '@/lib/lovense/service';
import { getDashboardWeather } from '@/lib/weather';
import { LEGAL_TERMS_VERSION } from '@/lib/auth';
import { getCurrentWeeklyLegalUpdate } from '@/lib/legal-content';

export const dynamic = 'force-dynamic';

export default async function ControlPage({ params }: { params: Promise<{ secureToken: string }> }) {
  const { secureToken } = await params;

  const member = await db.member.findUnique({
    where: { secureToken },
    include: { owner: { select: { name: true, weatherCity: true } } },
  });

  if (!member) notFound();

  if (!member.termsAcceptedAt || member.termsAcceptedVersion !== LEGAL_TERMS_VERSION) {
    const weeklyUpdate = getCurrentWeeklyLegalUpdate();
    return (
      <TermsAcceptancePanel
        secureToken={secureToken}
        username={member.username}
        platform={member.platform}
        weeklyCredit={member.weeklyCredit}
        isUpdate={Boolean(member.termsAcceptedAt)}
        legalVersion={LEGAL_TERMS_VERSION}
        weeklyUpdate={weeklyUpdate}
      />
    );
  }

  const activeSession = await db.session.findFirst({
    where: { active: true },
    orderBy: { startedAt: 'desc' },
  });
  const ownActiveSession = activeSession?.memberId === member.id ? activeSession : null;
  const elapsedSeconds = ownActiveSession
    // eslint-disable-next-line react-hooks/purity -- Server Component: initial elapsed time is request-time state.
    ? Math.floor((Date.now() - ownActiveSession.startedAt.getTime()) / 1000)
    : 0;

  const [toys, deviceStatus, weather] = await Promise.all([
    getToys(member.id).catch(() => []),
    getEffectiveLovenseStatus(member.id).catch(() => ({ connected: member.connected, battery: member.battery, toyName: member.toyName })),
    getDashboardWeather(member.owner?.weatherCity),
  ]);
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return (
    <ControlPanel
      memberId={member.id}
      secureToken={secureToken}
      username={member.username}
      platform={member.platform}
      active={member.active}
      toys={toys}
      memberSince={member.memberSince?.toISOString() ?? member.createdAt.toISOString()}
      subscriptionStartDate={member.startDate.toISOString()}
      subscriptionEndDate={member.endDate.toISOString()}
      currentMonthStartDate={currentMonthStart.toISOString()}
      currentMonthEndDate={currentMonthEnd.toISOString()}
      modelName={member.owner?.name ?? 'le modèle'}
      memberWeather={weather ? { modelName: member.owner?.name ?? 'le modèle', temperature: weather.temperature } : null}
      initial={{
        remainingCredit: member.remainingCredit,
        weeklyCredit: member.weeklyCredit,
        elapsedSeconds,
        isControlling: Boolean(activeSession),
        canControl: false,
        isWaiting: Boolean(activeSession),
        connected: deviceStatus.connected,
        battery: deviceStatus.battery,
        lastMessage: null,
      }}
    />
  );
}
