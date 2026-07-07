import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { MemberForm } from '@/components/member-form';
import { canAccessMember, requireAdmin } from '@/lib/auth';

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const member = await db.member.findUnique({ where: { id } });
  if (!member || !canAccessMember(admin, member)) notFound();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-50">Modifier {member.username}</h1>
      <MemberForm member={member} />
    </div>
  );
}
