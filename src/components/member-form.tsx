'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { Member } from '@prisma/client';
import { createMember, updateMember, type MemberFormState } from '@/server-actions/members';

const initialState: MemberFormState = {};
const FANCLUB_LEVELS = [
  { label: 'Membre Bronze — 5 min/semaine', minutes: 5 },
  { label: 'Membre Argent — 7 min/semaine', minutes: 7 },
  { label: 'Membre Or — 10 min/semaine', minutes: 10 },
] as const;

function toDateInputValue(date?: Date | string) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

export function MemberForm({ member }: { member?: Member }) {
  const router = useRouter();
  const action = member ? updateMember.bind(null, member.id) : createMember;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const weeklyCreditMinutes = member ? Math.round(member.weeklyCredit / 60) : FANCLUB_LEVELS[0].minutes;
  const isCustomLevel = !FANCLUB_LEVELS.some((level) => level.minutes === weeklyCreditMinutes);

  useEffect(() => {
    if (state.success) {
      if (state.emailWarning) {
        toast.warning(`${member ? 'Membre mis à jour' : 'Membre créé'}, mais email non envoyé : ${state.emailWarning}`);
      } else {
        toast.success(member ? 'Membre mis à jour.' : 'Membre créé et email envoyé si renseigné.');
      }
      router.push('/members');
      router.refresh();
    }
  }, [state.success, state.emailWarning, member, router]);

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-6">
      <Field label="Pseudo" name="username" error={state.errors?.username}>
        <input
          name="username"
          defaultValue={member?.username}
          className="input-field"
          placeholder="ex: LunaRose"
          required
        />
      </Field>

      <Field label="Email du membre" name="email" error={state.errors?.email}>
        <input
          name="email"
          type="email"
          defaultValue={member?.email ?? ''}
          className="input-field"
          placeholder="membre@example.com"
        />
        <p className="mt-1 text-xs text-neutral-500">Optionnel. Si renseigné, le membre reçoit automatiquement son code d’accès.</p>
      </Field>

      <Field label="Plateforme" name="platform" error={state.errors?.platform}>
        <select name="platform" defaultValue={member?.platform ?? ''} className="input-field" required>
          <option value="" disabled>
            Choisir une plateforme
          </option>
          <option value="OnlyFans">OnlyFans</option>
          <option value="Chaturbate">Chaturbate</option>
          <option value="Cam4">Cam4</option>
          <option value="Stripchat">Stripchat</option>
          <option value="Twitch">Twitch</option>
          <option value="Autre">Autre</option>
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Membre depuis" name="memberSince" error={state.errors?.memberSince}>
          <input
            type="date"
            name="memberSince"
            defaultValue={toDateInputValue(member?.memberSince ?? member?.createdAt) || toDateInputValue(new Date())}
            className="input-field"
            required
          />
        </Field>
        <Field label="Début de validité" name="startDate" error={state.errors?.startDate}>
          <input
            type="date"
            name="startDate"
            defaultValue={toDateInputValue(member?.startDate) || toDateInputValue(new Date())}
            className="input-field"
            required
          />
        </Field>
        <Field label="Fin de validité" name="endDate" error={state.errors?.endDate}>
          <input
            type="date"
            name="endDate"
            defaultValue={toDateInputValue(member?.endDate)}
            className="input-field"
            required
          />
        </Field>
      </div>

      <Field label="Niveau Fanclub" name="weeklyCredit" error={state.errors?.weeklyCredit}>
        <select
          name="weeklyCredit"
          defaultValue={weeklyCreditMinutes}
          className="input-field"
          required
        >
          {FANCLUB_LEVELS.map((level) => (
            <option key={level.minutes} value={level.minutes}>
              {level.label}
            </option>
          ))}
          {isCustomLevel && (
            <option value={weeklyCreditMinutes}>Personnalisé — {weeklyCreditMinutes} min/semaine</option>
          )}
        </select>
        <p className="mt-1 text-xs text-neutral-500">Le niveau définit automatiquement le crédit hebdomadaire.</p>
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Annuler
        </button>
        <button type="submit" disabled={isPending} className="btn-accent">
          {isPending ? 'Enregistrement...' : member ? 'Mettre à jour' : 'Créer le membre'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-300">{label}</span>
      {children}
      {error && <span className="text-xs text-red-400">{error[0]}</span>}
    </label>
  );
}
