import { Bluetooth, Clock3, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react';

const ITEMS = [
  {
    label: 'Plateforme réservée aux personnes majeures.',
    icon: UserCheck,
  },
  {
    label: 'Compatible Lovense.',
    icon: Bluetooth,
  },
  {
    label: 'Données chiffrées et sécurisées.',
    icon: LockKeyhole,
  },
  {
    label: 'Gestion privée des appareils.',
    icon: ShieldCheck,
  },
  {
    label: 'Tableau de bord accessible 24h/24 (hors maintenance).',
    icon: Clock3,
  },
];

export function SiteTrustFooter() {
  return (
    <footer className="site-trust-footer border-t border-white/10 bg-base-950 px-4 py-5 text-neutral-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 text-center text-xs sm:grid-cols-2 lg:grid-cols-5">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center justify-center gap-2 px-2">
            <item.icon className="h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
            <span className="leading-5">{item.label}</span>
          </div>
        ))}
      </div>
    </footer>
  );
}
