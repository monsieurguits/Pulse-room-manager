'use client';

import { useActionState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { updateWeatherCity, type WeatherCityFormState } from '@/server-actions/auth';

export function WeatherCityForm({ defaultValue }: { defaultValue?: string | null }) {
  const [state, action, pending] = useActionState<WeatherCityFormState, FormData>(updateWeatherCity, {});

  useEffect(() => {
    if (state.success) {
      toast.success('Ville météo enregistrée.');
    }
  }, [state.success]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="weatherCity" className="mb-2 block text-sm font-medium text-neutral-200">
          Ville utilisée pour la météo
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            id="weatherCity"
            name="weatherCity"
            className="input-field pl-10"
            defaultValue={defaultValue ?? ''}
            placeholder="Paris, Marseille, Bruxelles..."
            maxLength={80}
          />
        </div>
        {state.errors?.weatherCity ? <p className="mt-2 text-xs text-red-300">{state.errors.weatherCity[0]}</p> : null}
      </div>

      <button type="submit" className="btn-accent w-full justify-center sm:w-auto" disabled={pending}>
        {pending ? 'Enregistrement...' : 'Enregistrer la ville'}
      </button>
    </form>
  );
}
