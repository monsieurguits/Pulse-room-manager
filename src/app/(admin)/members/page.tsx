import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';
import { db } from '@/lib/db';
import { MembersTable } from '@/components/members-table';
import { MembersFilters } from '@/components/members-filters';
import { LEGAL_TERMS_VERSION, memberOwnerWhere, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  status?: 'all' | 'active' | 'suspended' | 'controlling';
  sort?: 'createdAt' | 'username' | 'remainingCredit' | 'endDate';
  dir?: 'asc' | 'desc';
  page?: string;
}

const PAGE_SIZE = 10;

export default async function MembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? '1'));
  const sort = params.sort ?? 'createdAt';
  const dir = params.dir ?? 'desc';

  const where = {
    ...memberOwnerWhere(admin),
    ...(params.q ? { username: { contains: params.q } } : {}),
    ...(params.status === 'active' ? { active: true } : {}),
    ...(params.status === 'suspended' ? { active: false } : {}),
    ...(params.status === 'controlling' ? { isControlling: true } : {}),
  };

  const [members, total] = await Promise.all([
    db.member.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.member.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-50">Membres</h1>
          <p className="mt-1 text-sm text-neutral-400">{total} membre(s) au total.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Link href="/legal" className="btn-secondary w-full justify-center sm:w-auto">
            <BookOpen size={18} />
            Relire les conditions générales
          </Link>
          <Link href="/members/new" className="btn-accent w-full sm:w-auto">
            <Plus size={18} />
            Nouveau membre
          </Link>
        </div>
      </div>

      <MembersFilters initial={{ q: params.q ?? '', status: params.status ?? 'all', sort, dir }} />

      <div className="card overflow-hidden">
        <MembersTable members={members} legalTermsVersion={LEGAL_TERMS_VERSION} />
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={{ pathname: '/members', query: { ...params, page: p } }}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              p === page ? 'bg-accent-500 text-white' : 'bg-base-850 text-neutral-400 hover:text-neutral-100'
            }`}
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  );
}
