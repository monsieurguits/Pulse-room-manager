import { getSettings } from '@/server-actions/settings';
import { SettingsForm } from '@/components/settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();
  // Le Developer Token ne quitte jamais le serveur : on ne transmet au
  // composant client qu'un indicateur booléen "un token existe déjà".
  const safeSettings = settings ? { ...settings, developerToken: '' } : null;
  const hasExistingToken = Boolean(settings?.developerToken);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-50">Paramètres</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Configuration de l&apos;intégration Lovense. Le Developer Token n&apos;est jamais envoyé au navigateur.
        </p>
      </div>
      <SettingsForm settings={safeSettings} hasExistingToken={hasExistingToken} />
    </div>
  );
}
