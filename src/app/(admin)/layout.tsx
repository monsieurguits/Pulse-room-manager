import Link from 'next/link';
import { LayoutDashboard, Settings, User, UserCog, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { logoutAdmin } from '@/server-actions/auth';

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/members', label: 'Membres', icon: Users },
  { href: '/models', label: 'Modèles', icon: UserCog, ownerOnly: true },
  { href: '/dashboard/account', label: 'Compte', icon: User },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, ownerOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const nav = NAV.filter((item) => !item.ownerOnly || admin.role === 'OWNER');

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-base-800 bg-base-900 p-5 md:block">
        <div className="mb-8 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent-500 shadow-glow" />
          <span className="text-lg font-bold tracking-tight">Pulse Room Manager</span>
        </div>
        <nav className="flex flex-col gap-1">
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
      <main className="flex-1 bg-base-950 p-6 md:p-8">{children}</main>
    </div>
  );
}
