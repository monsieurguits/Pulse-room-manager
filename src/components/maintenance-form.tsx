'use client';

import { useActionState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { updateMaintenanceMode, type MaintenanceFormState } from '@/server-actions/settings';

interface Props {
  defaultValues: {
    active: boolean;
    startInput: string;
    endInput: string;
    siteUsable: boolean;
  };
}

export function MaintenanceForm({ defaultValues }: Props) {
  const [state, action, pending] = useActionState<MaintenanceFormState, FormData>(updateMaintenanceMode, {});

  useEffect(() => {
    if (state.success) {
      toast.success('Mode maintenance mis à jour.');
    }
  }, [state.success]);

  return (
    <form action={action} className="card p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
          <Wrench size={20} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-200">Mode maintenance</h2>
          <p className="text-xs text-neutral-500">Affiche une popup sur le dashboard modèle et un bandeau sur ses pages.</p>
        </div>
      </div>

      <label className="mb-4 flex items-start gap-3 rounded-2xl border border-base-800 bg-base-950/70 p-4 text-sm text-neutral-300">
        <input name="maintenanceActive" type="checkbox" defaultChecked={defaultValues.active} className="mt-1 h-4 w-4 accent-[#ff2d87]" />
        <span>
          <span className="block font-semibold text-neutral-100">Activer le message de maintenance</span>
          <span className="mt-1 block text-neutral-500">Les modèles pourront fermer la popup, mais le bandeau restera visible.</span>
        </span>
      </label>
      {state.errors?.maintenanceActive ? <p className="-mt-2 mb-3 text-xs text-red-300">{state.errors.maintenanceActive[0]}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Début prévu" error={state.errors?.maintenanceStartAt?.[0]}>
          <input name="maintenanceStartAt" type="datetime-local" className="input-field" defaultValue={defaultValues.startInput} />
        </Field>
        <Field label="Fin prévue" error={state.errors?.maintenanceEndAt?.[0]}>
          <input name="maintenanceEndAt" type="datetime-local" className="input-field" defaultValue={defaultValues.endInput} />
        </Field>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-neutral-200">Utilisation du site pendant la maintenance</p>
        <select name="maintenanceSiteUsable" className="input-field" defaultValue={defaultValues.siteUsable ? 'yes' : 'no'}>
          <option value="yes">Le site reste utilisable</option>
          <option value="no">Le site risque d’être indisponible</option>
        </select>
      </div>

      <button type="submit" disabled={pending} className="btn-accent mt-5 w-full justify-center sm:w-auto">
        {pending ? 'Enregistrement...' : 'Enregistrer la maintenance'}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-200">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
