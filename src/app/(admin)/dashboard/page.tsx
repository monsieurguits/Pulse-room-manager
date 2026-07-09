import { Users, Zap, Gauge, Clock, CloudSun } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { getDashboardStats } from '@/lib/dashboard-queries';
import { formatDuration } from '@/lib/utils';
import { RecentSessionsTable } from '@/components/recent-sessions-table';
import { WeeklyUsageChart } from '@/components/weekly-usage-chart';
import { requireAdmin } from '@/lib/auth';
import { getDashboardWeather } from '@/lib/weather';
import { getMaintenanceSettings } from '@/lib/maintenance';
import { MaintenanceForm } from '@/components/maintenance-form';
import { MaintenanceNotice } from '@/components/maintenance-notice';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const [stats, weather, maintenance] = await Promise.all([
    getDashboardStats(admin),
    getDashboardWeather(admin.weatherCity),
    getMaintenanceSettings(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {admin.role === 'MODEL' && maintenance.notice ? (
        <MaintenanceNotice notice={maintenance.notice} showPopup showBanner={false} />
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-base-900/70 px-5 py-4 text-center shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent-500/15 text-accent-300">
          <CloudSun size={18} />
        </div>
        <p className="text-sm font-medium leading-6 text-neutral-300 sm:text-base">
          {weather ? (
            <>
              Hello, <span className="font-semibold text-neutral-50">{admin.name}</span>, aujourd&apos;hui les températures
              extérieures sont de{' '}
              <span className="font-semibold text-neutral-50">{Math.round(weather.temperature)}°C</span> à{' '}
              <span className="font-semibold text-neutral-50">{weather.city}</span>. Il est temps de{' '}
              <span className="font-semibold text-accent-300">{weather.action}</span>.
            </>
          ) : (
            <>
              Hello, <span className="font-semibold text-neutral-50">{admin.name}</span>, nous vous souhaitons une belle journée.
              Ajoutez votre ville dans Compte pour personnaliser ce message.
            </>
          )}
        </p>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-neutral-50">Tableau de bord</h1>
        <p className="mt-1 text-sm text-neutral-400">Vue d&apos;ensemble de l&apos;activité en temps réel.</p>
      </div>

      {admin.role === 'OWNER' ? (
        <MaintenanceForm
          defaultValues={{
            active: maintenance.active,
            startInput: maintenance.startInput,
            endInput: maintenance.endInput,
            siteUsable: maintenance.siteUsable,
          }}
        />
      ) : null}

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
