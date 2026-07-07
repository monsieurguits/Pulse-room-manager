import { cn } from '@/lib/utils';
import type { MemberStatus } from '@/types';

const CONFIG: Record<MemberStatus, { label: string; className: string }> = {
  idle: { label: 'Libre', className: 'bg-emerald-500/15 text-emerald-400' },
  controlling: { label: 'En cours', className: 'bg-accent-500/15 text-accent-400 animate-pulse-slow' },
  suspended: { label: 'Suspendu', className: 'bg-neutral-500/15 text-neutral-400' },
  expired: { label: 'Expiré', className: 'bg-red-500/15 text-red-400' },
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  const config = CONFIG[status];
  return <span className={cn('badge', config.className)}>{config.label}</span>;
}

export function deriveMemberStatus(member: {
  active: boolean;
  isControlling: boolean;
  endDate: Date | string;
}): MemberStatus {
  if (!member.active) return 'suspended';
  if (new Date(member.endDate) < new Date()) return 'expired';
  if (member.isControlling) return 'controlling';
  return 'idle';
}
