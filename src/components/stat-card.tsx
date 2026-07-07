import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent = false }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          accent ? 'bg-accent-500/15 text-accent-400' : 'bg-base-800 text-neutral-300'
        )}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-neutral-400">{label}</p>
        <p className="text-xl font-semibold text-neutral-50">{value}</p>
      </div>
    </div>
  );
}
