import { db } from '@/lib/db';

export interface MaintenanceNoticeInfo {
  active: boolean;
  startLabel: string;
  endLabel: string;
  siteUsable: boolean;
  updatedAtKey: string;
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) return 'Non renseigné';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function toDateTimeLocalValue(date: Date | null | undefined): string {
  if (!date) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function getMaintenanceSettings() {
  const settings = await db.settings.findUnique({
    where: { id: 'settings' },
    select: {
      maintenanceActive: true,
      maintenanceStartAt: true,
      maintenanceEndAt: true,
      maintenanceSiteUsable: true,
      updatedAt: true,
    },
  });

  return {
    active: settings?.maintenanceActive ?? false,
    startAt: settings?.maintenanceStartAt ?? null,
    endAt: settings?.maintenanceEndAt ?? null,
    siteUsable: settings?.maintenanceSiteUsable ?? true,
    startInput: toDateTimeLocalValue(settings?.maintenanceStartAt),
    endInput: toDateTimeLocalValue(settings?.maintenanceEndAt),
    notice: settings?.maintenanceActive
      ? {
          active: true,
          startLabel: formatDateTime(settings.maintenanceStartAt),
          endLabel: formatDateTime(settings.maintenanceEndAt),
          siteUsable: settings.maintenanceSiteUsable,
          updatedAtKey: settings.updatedAt.toISOString(),
        }
      : null,
  };
}
