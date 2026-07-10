import { LEGAL_TERMS_VERSION, requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { ModelForm } from '@/components/model-form';
import { resetModelPassword, setModelActive } from '@/server-actions/admin-users';
import { DeleteModelButton } from '@/components/delete-model-button';
import { PromoteModelButton } from '@/components/promote-model-button';
import { DemoteAdminButton } from '@/components/demote-admin-button';

export const dynamic = 'force-dynamic';

function isModelActivated(model: { legalAcceptedVersion: string | null; legalAcceptedAt: Date | null }) {
  return model.legalAcceptedVersion === LEGAL_TERMS_VERSION && Boolean(model.legalAcceptedAt);
}

function formatActivationDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function ActivationBadge({ model }: { model: { legalAcceptedVersion: string | null; legalAcceptedAt: Date | null } }) {
  const activated = isModelActivated(model);

  return (
    <div className="flex flex-col gap-1">
      {activated ? (
        <span className="badge w-fit bg-cyan-400/15 text-cyan-200">Compte activé</span>
      ) : (
        <span className="badge w-fit bg-amber-400/15 text-amber-200">Activation en attente</span>
      )}
      <span className="text-xs text-neutral-500">
        {activated ? `Validé le ${formatActivationDate(model.legalAcceptedAt)}` : 'Première connexion non finalisée'}
      </span>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return role === 'OWNER' ? (
    <span className="badge w-fit bg-cyan-400/15 text-cyan-200">Admin</span>
  ) : (
    <span className="badge w-fit bg-base-800 text-neutral-300">Modèle</span>
  );
}

export default async function ModelsPage() {
  const owner = await requireOwner();

  const models = await db.adminUser.findMany({
    where: {
      id: { not: owner.id },
      role: { in: ['MODEL', 'OWNER'] },
    },
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

      <div className="grid gap-4 xl:hidden">
        {models.map((model) => (
          <article key={model.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words font-semibold text-neutral-100">{model.name}</h2>
                <p className="mt-1 break-all text-xs text-neutral-500">{model.email}</p>
              </div>
              {model.active ? (
                <span className="badge shrink-0 bg-emerald-500/15 text-emerald-300">Actif</span>
              ) : (
                <span className="badge shrink-0 bg-base-800 text-neutral-400">Suspendu</span>
              )}
            </div>
            <p className="mt-4 rounded-xl border border-base-800 bg-base-950/70 px-3 py-2 text-sm text-neutral-400">
              Membres : <strong className="text-neutral-100">{model._count.members}</strong>
            </p>
            <div className="mt-3 rounded-xl border border-base-800 bg-base-950/70 px-3 py-2">
              <RoleBadge role={model.role} />
            </div>
            <div className="mt-3 rounded-xl border border-base-800 bg-base-950/70 px-3 py-2">
              <ActivationBadge model={model} />
            </div>
            <div className="mt-4 grid gap-3">
              <form action={setModelActive.bind(null, model.id, !model.active)}>
                <button className="btn-secondary w-full" type="submit">
                  {model.active ? 'Suspendre' : 'Réactiver'}
                </button>
              </form>
              <form action={resetModelPassword.bind(null, model.id)} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  placeholder="Nouveau mot de passe"
                  className="input-field h-10"
                />
                <button className="btn-secondary w-full sm:w-auto" type="submit">
                  Réinitialiser
                </button>
              </form>
              {model.role === 'MODEL' ? (
                <PromoteModelButton modelId={model.id} modelName={model.name} />
              ) : (
                <DemoteAdminButton adminId={model.id} adminName={model.name} />
              )}
              <DeleteModelButton modelId={model.id} modelName={model.name} role={model.role} />
            </div>
          </article>
        ))}
        {models.length === 0 && <p className="card p-6 text-center text-sm text-neutral-500">Aucun compte modèle pour le moment.</p>}
      </div>

      <div className="card hidden overflow-hidden xl:block">
        <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-base-800 bg-base-850/50 text-neutral-500">
              <th className="px-4 py-3 font-medium">Modèle</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Membres</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Activation</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id} className="border-b border-base-800/60 text-neutral-300">
                <td className="px-4 py-3 font-medium text-neutral-100">{model.name}</td>
                <td className="px-4 py-3">{model.email}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={model.role} />
                </td>
                <td className="px-4 py-3">{model._count.members}</td>
                <td className="px-4 py-3">
                  {model.active ? (
                    <span className="badge bg-emerald-500/15 text-emerald-300">Actif</span>
                  ) : (
                    <span className="badge bg-base-800 text-neutral-400">Suspendu</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ActivationBadge model={model} />
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
                    {model.role === 'MODEL' ? (
                      <PromoteModelButton modelId={model.id} modelName={model.name} />
                    ) : (
                      <DemoteAdminButton adminId={model.id} adminName={model.name} />
                    )}
                    <DeleteModelButton modelId={model.id} modelName={model.name} role={model.role} />
                  </div>
                </td>
              </tr>
            ))}
            {models.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Aucun compte modèle pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
