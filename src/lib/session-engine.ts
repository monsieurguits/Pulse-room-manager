import { db } from '@/lib/db';
import { stop as stopToy } from '@/lib/lovense/service';

/**
 * Moteur de session — unique responsable du débit du crédit.
 *
 * Règle absolue : `remainingCredit` n'est décrémenté qu'à un seul endroit
 * (tickAllActiveSessions, appelé une fois par seconde par le serveur WS).
 * Toute autre partie du code (Server Actions, API routes) ne fait que
 * créer/clôturer des lignes de Session ; elle ne touche jamais au crédit.
 */

export async function startSession(memberId: string, controlClientId?: string) {
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });

  if (!member.active) throw new Error('Ce membre est suspendu.');
  if (!member.termsAcceptedAt) throw new Error("Vous devez accepter les conditions avant d'accéder au contrôle.");
  if (member.remainingCredit <= 0) throw new Error('Crédit épuisé.');

  const runningTip = await db.tipCommand.findFirst({
    where: { status: 'running' },
    select: { id: true },
  });

  if (runningTip) {
    throw new Error("Un tip est en cours. Le contrôle membre sera disponible dès qu'il sera terminé.");
  }

  const activeSession = await db.session.findFirst({
    where: { active: true },
    orderBy: { startedAt: 'desc' },
  });

  if (activeSession) {
    const ownsActiveSession = activeSession.memberId === memberId && activeSession.controlClientId === controlClientId;
    const canClaimLegacySession = activeSession.memberId === memberId && !activeSession.controlClientId && controlClientId;

    if (canClaimLegacySession) {
      return db.session.update({
        where: { id: activeSession.id },
        data: { controlClientId },
      });
    }

    if (ownsActiveSession) return activeSession;
    throw new Error("Vous êtes sur la liste d'attente. Une autre personne contrôle actuellement ce Lovense.");
  }

  const now = new Date();
  if (now < member.startDate || now > member.endDate) {
    throw new Error("L'abonnement de ce membre n'est pas valide actuellement.");
  }

  const [session] = await db.$transaction([
    db.session.create({
      data: {
        memberId,
        startedAt: now,
        active: true,
        creditRemaining: member.remainingCredit,
        controlClientId,
      },
    }),
    db.member.update({
      where: { id: memberId },
      data: { isControlling: true },
    }),
  ]);

  return session;
}

export async function stopSession(memberId: string, reason: 'manual' | 'credit-exhausted' | 'restart' = 'manual') {
  const session = await db.session.findFirst({
    where: { memberId, active: true },
    orderBy: { startedAt: 'desc' },
  });

  if (!session) return null;

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - session.startedAt.getTime()) / 1000));

  const [updatedSession] = await db.$transaction([
    db.session.update({
      where: { id: session.id },
      data: {
        active: false,
        endedAt: new Date(),
        duration: elapsedSeconds,
      },
    }),
    db.member.update({
      where: { id: memberId },
      data: { isControlling: false },
    }),
  ]);

  // On coupe le jouet uniquement si l'arrêt n'est pas dû à un simple redémarrage serveur
  // (dans ce cas, la commande Stop a déjà été envoyée avant l'arrêt, voir restoreActiveSessions).
  if (reason !== 'restart') {
    void stopToy(memberId)
      .catch(() => undefined)
      .finally(() => triggerPendingTipCommands());
  } else {
    triggerPendingTipCommands();
  }

  return updatedSession;
}

function triggerPendingTipCommands(): void {
  import('@/lib/lovense/service')
    .then(({ processPendingTipCommands }) => processPendingTipCommands())
    .catch(() => undefined);
}

export async function assertSessionController(memberId: string, controlClientId?: string): Promise<void> {
  const session = await db.session.findFirst({
    where: { memberId, active: true },
    orderBy: { startedAt: 'desc' },
  });

  if (!session) throw new Error('Aucune session de contrôle active.');
  if (!session.controlClientId && controlClientId) {
    await db.session.update({ where: { id: session.id }, data: { controlClientId } });
    return;
  }

  if (!controlClientId || session.controlClientId !== controlClientId) {
    throw new Error("Vous êtes sur la liste d'attente. Une autre personne contrôle actuellement ce Lovense.");
  }
}

export async function pauseSession(memberId: string) {
  // Une pause n'arrête pas le décompte de session en base (elle reste "active"),
  // mais interrompt physiquement le jouet et suspend le débit de crédit via le flag isControlling.
  await db.member.update({ where: { id: memberId }, data: { isControlling: false } });
  await stopToy(memberId).catch(() => undefined);
}

export async function resumeSession(memberId: string) {
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });
  if (member.remainingCredit <= 0) throw new Error('Crédit épuisé.');
  await db.member.update({ where: { id: memberId }, data: { isControlling: true } });
}

type Publisher = (memberId: string | null, payload: unknown) => void;

/**
 * Appelée une fois par seconde par le serveur WebSocket.
 * Décrémente le crédit de chaque membre "isControlling", et arrête
 * automatiquement le contrôle si le crédit atteint zéro.
 */
export async function tickAllActiveSessions(publish: Publisher): Promise<void> {
  const controllingMembers = await db.member.findMany({ where: { isControlling: true } });

  for (const member of controllingMembers) {
    if (member.remainingCredit <= 0) {
      await stopSession(member.id, 'credit-exhausted');
      publish(member.id, { type: 'session-stopped', memberId: member.id, reason: 'credit-exhausted' });
      continue;
    }

    const newRemaining = member.remainingCredit - 1;

    const session = await db.session.findFirst({
      where: { memberId: member.id, active: true },
      orderBy: { startedAt: 'desc' },
    });

    await db.$transaction([
      db.member.update({ where: { id: member.id }, data: { remainingCredit: newRemaining } }),
      ...(session
        ? [db.session.update({ where: { id: session.id }, data: { creditUsed: { increment: 1 } } })]
        : []),
    ]);

    const elapsedSeconds = session ? Math.floor((Date.now() - session.startedAt.getTime()) / 1000) : 0;

    publish(member.id, {
      type: 'credit-tick',
      memberId: member.id,
      remainingCredit: newRemaining,
      elapsedSeconds,
      isControlling: newRemaining > 0,
    });

    if (newRemaining <= 0) {
      await stopSession(member.id, 'credit-exhausted');
      publish(member.id, { type: 'session-stopped', memberId: member.id, reason: 'credit-exhausted' });
    }
  }
}

const CREDIT_RESET_TIME_ZONE = 'Europe/Paris';
const CREDIT_RESET_WEEKDAY = 0; // Sunday
const CREDIT_RESET_HOUR = 23;
const CREDIT_RESET_MINUTE = 59;

function getParisDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CREDIT_RESET_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  };
}

function getParisWeekday(date: Date): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: CREDIT_RESET_TIME_ZONE,
    weekday: 'short',
  }).format(date);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
}

function getTimeZoneOffsetMinutes(date: Date): number {
  const parts = getParisDateParts(date);
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return (localAsUtc - date.getTime()) / 60_000;
}

function parisWallTimeToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMinutes * 60_000);
}

export function getLatestWeeklyCreditResetAt(now = new Date()): Date {
  const parisNow = getParisDateParts(now);
  const weekday = getParisWeekday(now);
  const daysSinceSunday = (weekday - CREDIT_RESET_WEEKDAY + 7) % 7;

  const parisTodayUtc = Date.UTC(parisNow.year, parisNow.month - 1, parisNow.day);
  const resetDay = new Date(parisTodayUtc - daysSinceSunday * 24 * 60 * 60 * 1000);
  let resetAt = parisWallTimeToUtc(
    resetDay.getUTCFullYear(),
    resetDay.getUTCMonth() + 1,
    resetDay.getUTCDate(),
    CREDIT_RESET_HOUR,
    CREDIT_RESET_MINUTE
  );

  if (now < resetAt) {
    const previousResetDay = new Date(resetDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    resetAt = parisWallTimeToUtc(
      previousResetDay.getUTCFullYear(),
      previousResetDay.getUTCMonth() + 1,
      previousResetDay.getUTCDate(),
      CREDIT_RESET_HOUR,
      CREDIT_RESET_MINUTE
    );
  }

  return resetAt;
}

/**
 * Réinitialise le crédit hebdomadaire après le dernier dimanche 23:59 Europe/Paris.
 * Si le serveur était arrêté au moment exact, le reset se fait au prochain check.
 */
export async function resetWeeklyCreditsIfDue(now = new Date()): Promise<number> {
  const latestResetAt = getLatestWeeklyCreditResetAt(now);
  const due = await db.member.findMany({ where: { lastReset: { lt: latestResetAt } } });

  await Promise.all(
    due.map((member) =>
      db.member.update({
        where: { id: member.id },
        data: { remainingCredit: member.weeklyCredit, lastReset: latestResetAt },
      })
    )
  );

  return due.length;
}

/**
 * Restauration au démarrage du serveur WS : toute session marquée "active"
 * en base (donc interrompue par un crash/redémarrage) est proprement close,
 * le jouet est stoppé par sécurité, et isControlling repassé à false.
 * Aucune session active ne doit rester orpheline après un redémarrage.
 */
export async function restoreActiveSessions(): Promise<void> {
  const orphanSessions = await db.session.findMany({ where: { active: true } });

  for (const session of orphanSessions) {
    await stopSession(session.memberId, 'restart');
  }
}
