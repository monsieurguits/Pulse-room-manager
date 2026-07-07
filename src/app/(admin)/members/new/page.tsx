import { MemberForm } from '@/components/member-form';

export const dynamic = 'force-dynamic';

export default function NewMemberPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-50">Nouveau membre</h1>
      <MemberForm />
    </div>
  );
}
