import { AccountPasswordForm } from '@/components/account-password-form';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-50">Compte</h1>
        <p className="mt-1 text-sm text-neutral-400">Gérez votre accès administrateur.</p>
      </div>

      <div className="card max-w-2xl p-5">
        <h2 className="text-sm font-semibold text-neutral-200">Profil</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <div>
            <p className="text-neutral-500">Nom</p>
            <p className="font-medium text-neutral-100">{admin.name}</p>
          </div>
          <div>
            <p className="text-neutral-500">Email</p>
            <p className="font-medium text-neutral-100">{admin.email}</p>
          </div>
          <div>
            <p className="text-neutral-500">Rôle</p>
            <p className="font-medium text-neutral-100">{admin.role === 'OWNER' ? 'Propriétaire' : 'Modèle'}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-200">Mot de passe</h2>
        <AccountPasswordForm />
      </div>
    </div>
  );
}
