'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';

interface Props {
  initial: { q: string; status: string; sort: string; dir: string };
}

export function MembersFilters({ initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initial.q);
  const [, startTransition] = useTransition();

  function updateParams(next: Partial<Props['initial']>) {
    const merged = { ...initial, ...next, q: next.q ?? query };
    const search = new URLSearchParams();
    if (merged.q) search.set('q', merged.q);
    if (merged.status && merged.status !== 'all') search.set('status', merged.status);
    if (merged.sort) search.set('sort', merged.sort);
    if (merged.dir) search.set('dir', merged.dir);

    startTransition(() => {
      router.push(`${pathname}?${search.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && updateParams({ q: query })}
          placeholder="Rechercher un pseudo..."
          className="input-field pl-9"
        />
      </div>

      <select
        defaultValue={initial.status}
        onChange={(e) => updateParams({ status: e.target.value })}
        className="input-field w-auto"
      >
        <option value="all">Tous les statuts</option>
        <option value="active">Actifs</option>
        <option value="suspended">Suspendus</option>
        <option value="controlling">En contrôle</option>
      </select>

      <select
        defaultValue={`${initial.sort}:${initial.dir}`}
        onChange={(e) => {
          const [sort, dir] = e.target.value.split(':');
          updateParams({ sort, dir });
        }}
        className="input-field w-auto"
      >
        <option value="createdAt:desc">Plus récents</option>
        <option value="username:asc">Pseudo (A-Z)</option>
        <option value="remainingCredit:desc">Crédit restant</option>
        <option value="endDate:asc">Expiration proche</option>
      </select>
    </div>
  );
}
