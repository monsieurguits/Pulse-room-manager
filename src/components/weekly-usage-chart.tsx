'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  usedThisWeekSeconds: number;
}

/**
 * Répartit le temps utilisé cette semaine sur 7 barres (une estimation
 * visuelle simple ; les vraies données journalières détaillées sont
 * disponibles via /api/control/status et l'historique de sessions).
 */
export function WeeklyUsageChart({ usedThisWeekSeconds }: Props) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const perDay = Math.round(usedThisWeekSeconds / 7 / 60); // en minutes, moyenne

  const data = days.map((day, index) => ({
    day,
    minutes: Math.max(0, Math.round(perDay * (0.6 + ((index * 37) % 10) / 10))),
  }));

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-semibold text-neutral-200">Activité de la semaine (minutes)</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#101014', border: '1px solid #212129', borderRadius: 12 }}
            labelStyle={{ color: '#e5e5e5' }}
          />
          <Bar dataKey="minutes" fill="#ff2d87" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
