import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { ModelForm } from '@/components/model-form';
import { resetModelPassword, setModelActive } from '@/server-actions/admin-users';

export const dynamic = 'force-dynamic';

export default async function ModelsPage() {
  await requireOwner();

  const models = await db.adminUser.findMany({
    where: { role: 'MODEL' },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-50">Modèles</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Crée les accès admin des diffuseuses. Chaque modèle ne voit que ses propres membres.
        </p>
      </div>

      <ModelForm />

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-base-800 bg-base-850/50 text-neutral-500">
              <th className="px-4 py-3 font-medium">Modèle</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Membres</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id} className="border-b border-base-800/60 text-neutral-300">
                <td className="px-4 py-3 font-medium text-neutral-100">{model.name}</td>
                <td className="px-4 py-3">{model.email}</td>
                <td className="px-4 py-3">{model._count.members}</td>
                <td className="px-4 py-3">
                  {model.active ? (
                    <span className="badge bg-emerald-500/15 text-emerald-300">Actif</span>
                  ) : (
                    <span className="badge bg-base-800 text-neutral-400">Suspendu</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <form action={setModelActive.bind(null, model.id, !model.active)}>
                      <button className="btn-secondary" type="submit">
                        {model.active ? 'Suspendre' : 'Réactiver'}
                      </button>
                    </form>
                    <form action={resetModelPassword.bind(null, model.id)} className="flex gap-2">
                      <input
                        name="password"
                        type="password"
                        minLength={8}
                        placeholder="Nouveau mot de passe"
                        className="input-field h-10 w-52"
                      />
                      <button className="btn-secondary" type="submit">
                        Réinitialiser
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {models.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Aucun compte modèle pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
