import type { LucideIcon } from 'lucide-react';
import { Crown, Medal, Sparkles, Star } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

type MemberTier = 'bronze' | 'silver' | 'gold' | 'custom';

interface TierConfig {
  label: string;
  duration: string;
  Icon: LucideIcon;
  className: string;
  glowClassName: string;
}

const TIER_BY_WEEKLY_CREDIT: Record<number, MemberTier> = {
  300: 'bronze',
  420: 'silver',
  600: 'gold',
};

const TIER_CONFIG: Record<MemberTier, TierConfig> = {
  bronze: {
    label: 'Membre Bronze',
    duration: '5 min/semaine',
    Icon: Medal,
    className: 'border-amber-700/70 bg-gradient-to-r from-amber-950 via-orange-900 to-amber-700 text-amber-100',
    glowClassName: 'bg-amber-400/35',
  },
  silver: {
    label: 'Membre Argent',
    duration: '7 min/semaine',
    Icon: Star,
    className: 'border-slate-300/50 bg-gradient-to-r from-slate-800 via-zinc-500 to-slate-200 text-white',
    glowClassName: 'bg-slate-200/35',
  },
  gold: {
    label: 'Membre Or',
    duration: '10 min/semaine',
    Icon: Crown,
    className: 'border-yellow-300/60 bg-gradient-to-r from-yellow-900 via-amber-500 to-yellow-200 text-yellow-950',
    glowClassName: 'bg-yellow-300/45',
  },
  custom: {
    label: 'Membre personnalisé',
    duration: 'Crédit personnalisé',
    Icon: Sparkles,
    className: 'border-accent-500/50 bg-gradient-to-r from-base-800 via-accent-700 to-accent-400 text-white',
    glowClassName: 'bg-accent-400/35',
  },
};

export function getMemberTier(weeklyCredit: number): MemberTier {
  return TIER_BY_WEEKLY_CREDIT[weeklyCredit] ?? 'custom';
}

export function MemberTierBadge({
  weeklyCredit,
  size = 'compact',
  className,
}: {
  weeklyCredit: number;
  size?: 'compact' | 'large';
  className?: string;
}) {
  const tier = getMemberTier(weeklyCredit);
  const config = TIER_CONFIG[tier];
  const Icon = config.Icon;
  const duration = tier === 'custom' ? formatDuration(weeklyCredit) : config.duration;

  if (size === 'large') {
    return (
      <div
        className={cn(
          'relative mx-auto inline-flex max-w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-lg',
          config.className,
          className
        )}
      >
        <span className={cn('absolute -right-5 -top-8 h-16 w-16 rounded-full blur-2xl', config.glowClassName)} />
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/18">
          <Icon size={22} />
        </span>
        <span className="relative min-w-0 text-left">
          <span className="block truncate text-sm font-bold">{config.label}</span>
          <span className="block text-xs font-medium opacity-85">{duration}</span>
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm',
        config.className,
        className
      )}
    >
      <Icon size={14} className="shrink-0" />
      <span className="truncate">{config.label}</span>
    </span>
  );
}
