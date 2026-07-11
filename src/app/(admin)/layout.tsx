import Link from 'next/link';
import { LayoutDashboard, LogOut, Settings, SlidersHorizontal, User, UserCog, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { hasAcceptedCurrentLegalTerms, requireAdmin } from '@/lib/auth';
import { logoutAdmin } from '@/server-actions/auth';
import { getMaintenanceSettings } from '@/lib/maintenance';
import { MaintenanceNotice } from '@/components/maintenance-notice';
import { db } from '@/lib/db';
import { memberOwnerWhere } from '@/lib/auth';
import { MessagesNavLink } from '@/components/messages/messages-nav-link';
import { countUnreadAdminDirectMessages } from '@/lib/admin-direct-messages';

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/members', label: 'Membres', icon: Users },
  { href: '/models', label: 'Modèles', icon: UserCog, ownerOnly: true },
  { href: '/dashboard/account', label: 'Compte', icon: User },
  { href: '/dashboard/technical', label: 'Technique', icon: SlidersHorizontal },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, ownerOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!hasAcceptedCurrentLegalTerms(admin)) {
    redirect('/legal/accept');
  }

  const nav = NAV.filter((item) => !item.ownerOnly || admin.role === 'OWNER');
  const maintenance = admin.role === 'MODEL' ? await getMaintenanceSettings() : null;
  const unreadMessages = await db.directMessage.count({
    where: { member: memberOwnerWhere(admin), sender: 'member', readByModelAt: null },
  });
  const unreadInternalMessages = await countUnreadAdminDirectMessages(admin.id);
  const unreadTotal = unreadMessages + unreadInternalMessages;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <header className="border-b border-base-800 bg-base-900 px-4 py-3 md:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <img src="/pulseroom-mark-transparent.png" alt="" className="h-9 w-9 shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-[0.16em] text-neutral-50">PULSEROOM</p>
              <p className="truncate text-xs text-neutral-500">{admin.name}</p>
            </div>
          </div>
          <form action={logoutAdmin}>
            <button className="rounded-xl border border-base-700 bg-base-850 p-2 text-neutral-300" type="submit" title="Déconnexion">
              <LogOut size={17} />
            </button>
          </form>
        </div>
        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <MessagesNavLink initialUnread={unreadTotal} compact />
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-base-800 bg-base-950 px-3 py-2 text-xs font-medium text-neutral-300"
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <aside className="hidden w-64 shrink-0 border-r border-base-800 bg-base-900 p-5 md:block">
        <div className="mb-8 flex items-center gap-2">
          <img src="/pulseroom-mark-transparent.png" alt="" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold tracking-[0.18em] text-neutral-50">PULSEROOM</span>
        </div>
        <nav className="flex flex-col gap-1">
          <MessagesNavLink initialUnread={unreadTotal} />
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-base-800 hover:text-accent-400"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-base-800 pt-5">
          <p className="truncate text-sm font-semibold text-neutral-200">{admin.name}</p>
          <p className="truncate text-xs text-neutral-500">{admin.email}</p>
          <form action={logoutAdmin} className="mt-4">
            <button className="btn-secondary w-full justify-center" type="submit">
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-x-hidden bg-base-950 p-4 sm:p-6 md:p-8">
        {admin.role === 'MODEL' && maintenance?.notice ? <MaintenanceNotice notice={maintenance.notice} /> : null}
        {children}
      </main>
    </div>
  );
}
