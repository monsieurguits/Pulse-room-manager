import Link from 'next/link';
import { LayoutDashboard, Users, Settings } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/members', label: 'Membres', icon: Users },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-base-800 bg-base-900 p-5 md:block">
        <div className="mb-8 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent-500 shadow-glow" />
          <span className="text-lg font-bold tracking-tight">Pulse Room Manager</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
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
      </aside>
      <main className="flex-1 bg-base-950 p-6 md:p-8">{children}</main>
    </div>
  );
}
