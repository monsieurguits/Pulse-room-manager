import { db } from '@/lib/db';
import { memberOwnerWhere, type CurrentAdmin } from '@/lib/auth';
import type { DashboardStats } from '@/types';

export async function getDashboardStats(admin: CurrentAdmin): Promise<DashboardStats> {
  const memberWhere = memberOwnerWhere(admin);
  const sessionWhere = admin.role === 'OWNER' ? {} : { member: { ownerId: admin.id } };
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [totalMembers, activeControls, members, todaySessions, weekSessions, recentSessions] = await Promise.all([
    db.member.count({ where: memberWhere }),
    db.member.count({ where: { ...memberWhere, isControlling: true } }),
    db.member.findMany({ where: memberWhere, select: { remainingCredit: true } }),
    db.session.findMany({ where: { ...sessionWhere, startedAt: { gte: startOfToday } }, select: { duration: true, active: true, startedAt: true } }),
    db.session.findMany({ where: { ...sessionWhere, startedAt: { gte: startOfWeek } }, select: { duration: true, active: true, startedAt: true } }),
    db.session.findMany({ where: sessionWhere, orderBy: { startedAt: 'desc' }, take: 10 }),
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
