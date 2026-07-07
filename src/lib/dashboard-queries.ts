import { db } from '@/lib/db';
import type { DashboardStats } from '@/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [totalMembers, activeControls, members, todaySessions, weekSessions, recentSessions] = await Promise.all([
    db.member.count(),
    db.member.count({ where: { isControlling: true } }),
    db.member.findMany({ select: { remainingCredit: true } }),
    db.session.findMany({ where: { startedAt: { gte: startOfToday } }, select: { duration: true, active: true, startedAt: true } }),
    db.session.findMany({ where: { startedAt: { gte: startOfWeek } }, select: { duration: true, active: true, startedAt: true } }),
    db.session.findMany({ orderBy: { startedAt: 'desc' }, take: 10 }),
  ]);

  const averageCredit = members.length
    ? Math.round(members.reduce((sum, m) => sum + m.remainingCredit, 0) / members.length)
    : 0;

  const sumDuration = (sessions: { duration: number; active: boolean; startedAt: Date }[]) =>
    sessions.reduce((sum, s) => {
      if (s.active) {
        return sum + Math.floor((Date.now() - s.startedAt.getTime()) / 1000);
      }
      return sum + s.duration;
    }, 0);

  return {
    totalMembers,
    activeControls,
    averageCredit,
    usedTodaySeconds: sumDuration(todaySessions),
    usedThisWeekSeconds: sumDuration(weekSessions),
    recentSessions,
  };
}
