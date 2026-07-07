import { Users, Zap, Gauge, Clock } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { getDashboardStats } from '@/lib/dashboard-queries';
import { formatDuration } from '@/lib/utils';
import { RecentSessionsTable } from '@/components/recent-sessions-table';
import { WeeklyUsageChart } from '@/components/weekly-usage-chart';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats(admin);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-50">Tableau de bord</h1>
        <p className="mt-1 text-sm text-neutral-400">Vue d&apos;ensemble de l&apos;activité en temps réel.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Membres" value={String(stats.totalMembers)} icon={Users} />
        <StatCard label="Contrôles actifs" value={String(stats.activeControls)} icon={Zap} accent />
        <StatCard label="Crédit moyen" value={formatDuration(stats.averageCredit)} icon={Gauge} />
        <StatCard label="Temps utilisé aujourd'hui" value={formatDuration(stats.usedTodaySeconds)} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyUsageChart usedThisWeekSeconds={stats.usedThisWeekSeconds} />
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-200">Résumé de la semaine</h2>
          <p className="text-3xl font-bold text-accent-400">{formatDuration(stats.usedThisWeekSeconds)}</p>
          <p className="mt-1 text-sm text-neutral-400">de contrôle cumulé sur 7 jours glissants</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-200">Dernières connexions / sessions</h2>
        <RecentSessionsTable sessions={stats.recentSessions} />
      </div>
    </div>
  );
}
